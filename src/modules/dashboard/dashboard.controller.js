import { User } from "../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { Token } from "../../../DB/models/token.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Article } from "../../../DB/models/article.model.js";
import { Post } from "../../../DB/models/post.model.js";
import { Doctor } from "../../../DB/models/doctor.model.js";
import { sendEmail } from "../../utils/sendEmails.js";

export const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await User.findOne({
    email,
    role: "admin",
    isDeleted: false,
  });
  if (!admin) {
    const error = new Error("This admin not found");
    error.cause = 404;
    return next(error);
  }
  const isValidPassword = bcryptjs.compareSync(password, admin.password);
  if (!isValidPassword) {
    const error = new Error("Invalid credentials");
    error.cause = 400;
    return next(error);
  }
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
  await Token.create({ token, user: admin._id });

  await admin.save();
  res.status(200).json({ message: "Logged in successfully", data: token });
});
export const logoutAdmin = asyncHandler(async (req, res, next) => {
  const  token  = req.token; // Extract token from request headers
  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  // Remove token from database
  await Token.findOneAndDelete({ token });

  res.status(200).json({ message: "Logged out successfully" });
});
export const addAdmin = asyncHandler(async (req, res, next) => {
  const { email, password, userName } = req.body;

  // Check if the admin already exists
  const existingAdmin = await User.findOne({ email, role: "admin" });
  if (existingAdmin) {
    return res.status(400).json({ message: "Admin already exists" });
  }


  const newAdmin = new User({
    email,
    password,
    userName,
    role: "admin",
    isConfirmed:true
  });

  await newAdmin.save();
  res.status(201).json({ message: "Admin added successfully", data: newAdmin });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ role: "user", isDeleted: false }).select(
    "-password"
  );

  if (!users.length) {
    return res.status(404).json({
      success: false,
      message: "No users found",
    });
  }

  res.status(200).json({
    success: true,
    data: users,
  });
});

//logout & update password from regular users 
export const blockUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Get user ID from request params

  const user = await User.findById(id);
  if (!user) {
    const error = new Error("User not found");
    error.cause = 404;
    return next(error);
  }

  // Prevent blocking another admin
  if (user.role === "admin") {
    const error = new Error("You cannot block an admin");
    error.cause = 403;
    return next(error);
  }

  // Toggle user block status
  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User has been ${
      user.isBlocked ? "blocked" : "unblocked"
    } successfully`,
  });
});


export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Helper function to get today's and yesterday's count
  const getCounts = async (model) => {
    const todayCount = await model.countDocuments({
      createdAt: { $gte: today.setHours(0, 0, 0, 0) },
    });

    const yesterdayCount = await model.countDocuments({
      createdAt: {
        $gte: yesterday.setHours(0, 0, 0, 0),
        $lt: today.setHours(0, 0, 0, 0),
      },
    });

    const percentageChange =
      yesterdayCount === 0
        ? todayCount // Avoid division by zero
        : ((todayCount - yesterdayCount) / yesterdayCount) * 100;

    return { total: await model.countDocuments(), change: percentageChange };
  };

  // Fetch counts for each model
  const users = await getCounts(User);
  const articles = await getCounts(Article);
  const posts = await getCounts(Post);
  const doctors = await getCounts(Doctor);

  res.status(200).json({
    success: true,
    data: {
      users,
      articles,
      posts,
      doctors,
    },
  });
});


export const getUserGrowth = asyncHandler(async (req, res, next) => {
  const { month, year } = req.query;

  // Validate month and year
  if (!month || !year) {
    return res.status(400).json({
      success: false,
      message: "Please provide both month and year (e.g., ?month=1&year=2024)",
    });
  }

  const selectedMonth = parseInt(month);
  const selectedYear = parseInt(year);

  if (
    isNaN(selectedMonth) ||
    isNaN(selectedYear) ||
    selectedMonth < 1 ||
    selectedMonth > 12
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid month or year" });
  }

  // Get first and last day of the selected month
  const startDate = new Date(selectedYear, selectedMonth - 1, 1); // 1st day of month
  const endDate = new Date(selectedYear, selectedMonth, 0); // Last day of month

  // Aggregate users by date
  const userGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by date (ascending)
    },
  ]);

  // Convert to object for easy lookup
  const userGrowthMap = userGrowth.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Generate full list of days with zeroes for missing days
  const dailyData = [];
  for (let day = 1; day <= endDate.getDate(); day++) {
    const dateKey = `${selectedYear}-${String(selectedMonth).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    dailyData.push({ date: dateKey, count: userGrowthMap[dateKey] || 0 });
  }

  res.status(200).json({
    success: true,
    data: dailyData,
  });
});

export const sendEmailToAllUsers = asyncHandler(async (req, res, next) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Subject and message are required",
    });
  }

  // Get all active users
  const users = await User.find({ isDeleted: false }).select("email");

  if (!users.length) {
    return res.status(404).json({
      success: false,
      message: "No users found to send emails to",
    });
  }

  // Send email to each user
  const emailPromises = users.map((user) =>
    sendEmail({
      to: user.email,
      subject,
      html: `<p>${message}</p>`,
    })
  );

  await Promise.all(emailPromises);

  res.status(200).json({
    success: true,
    message: "Emails have been sent successfully to all users",
  });
});

export const sendEmailToSingleUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Subject and message are required",
    });
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Send warning email
  await sendEmail({
    to: user.email,
    subject,
    html: `<p>${message}</p>`,
  });

  res.status(200).json({
    success: true,
    message: "Email has been sent successfully",
  });
});
