import * as Yup from "yup";
import User from "../models/User";
import File from "../models/File";

class UserController {
  async index(req, res) {
    const user = await User.findByPk(req.userId);

    const { status } = user;

    return res.json({ status });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      bio: Yup.string().required(),
      password: Yup.string().required().min(6),
    });

    schema.isValid(req.body).then(function (valid) {
      if (valid) {
        return;
      } else {
        return res.status(400).json({ error: "Validations fails!" });
      }
    });

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }
    const { id, name, email, provider, status } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
      status,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar: Yup.number(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when("oldPassword", (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      ),
    });

    schema.isValid(req.body).then(function (valid) {
      if (valid) {
        return;
      } else {
        return res.status(400).json({ error: "Validations fails!" });
      }
    });

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: "User already exists" });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: "Password does not match" });
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: "avatar",
          attributes: ["id", "path", "url"],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }

  async like(req, res) {
    const currentUser = await User.findByPk(req.userId);
    const { id } = req.params;
    const userToLike = await User.findByPk(id);

    currentUser.addUser(userToLike);

    const user = currentUser.getUser();

    return res.status(200).json({ user });
  }
}

export default new UserController();
