import { sendEmail } from "../utils/mailer.js"
import User from "../models/user.js"
import { nanoid } from 'nanoid'
import { hashPassword } from "../utils/auth.js"

export const sendCodeToEmail = async (req, res) => {
    const response = "we have sent email if exists.";
    
    try{
        const {email} = req.body
        
        if(!email) {
            return res.status(400).json({ok: false, message: response})
        }
        
        const code = nanoid(6);
        const token = await hashPassword(code)

        const user = await User.findOneAndUpdate({email}, {passwordResetCode: token}).exec();

        if(!user) {
            return res.status(400).json({ok: false, message: response});
        }

        const html = `
            <div>
                <h2>please copy the code below and send it for us to reset your password \n</h2>
                <p><strong>${code}</strong></p>
                <p>do nothing if you didn't send this request</p>
            </div>
        `;

        const info = await sendEmail(email, 'reset password code from my app', '', html);

        if(!info) {
            return res.status(500).json({ok: true, message: 'something went wrong! please try again'});
        }

        if(info['accepted'].length) {
            return res.status(200).json({ok: true, message: 'email sent successfully'});
        } else if(info['rejected'].length) {
            return res.status(500).json({ok: true, message: response});
        }

    } catch(err) {
        console.log(err.message);
        return res.status(500).json({ok: false, message: 'something went wrong! please try again'})
    }
    
}