import Mail from "../../lib/Mail";
import Str from "@supercharge/strings";
import User from "../models/User";

class ChangePasswordController {
  async update(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    const randomPassword = Str.random();

    if (user) {
      await user.update({ email, password: randomPassword });
    }

    await Mail.sendMail({
      to: email,
      subject: "Teste de envio de e-mail",
      template: "redefinePassword",
      context: {
        user: user.name,
        password: randomPassword,
      },
    });

    return res.json({ message: "E-mail sent" });
  }
}

export default new ChangePasswordController();
