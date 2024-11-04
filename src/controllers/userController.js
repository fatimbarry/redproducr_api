const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { jwtSecret } = require("../config/config");

class UserController {
  static async register(req, res) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.create({
        ...req.body,
        password: hashedPassword,
      });
      res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const user = await User.findByEmail(req.body.email);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res
          .status(400)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      const token = jwt.sign({ id: user.id }, jwtSecret);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async profile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = UserController;
