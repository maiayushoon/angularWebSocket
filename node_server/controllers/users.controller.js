import User from "../models/User.js";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0, __v: 0 }).sort({ username: 1 });
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
}