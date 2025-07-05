const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const emailService = {
  async sendOrderConfirmation(userEmail, orderDetails) {

    const attachments = [];

    const itemsHtml = orderDetails.items.map((item, index) => {
      const cid = `image_${index}@techemporium.com`;
      const imagePath = item.imageUrl ? path.join(__dirname, '../public', item.imageUrl) : null;

      console.log(`[Email Debug] Processing image for ${item.productName}. imageUrl: ${item.imageUrl} Calculated path: ${imagePath}`);

      let imageTag = '';
      if (imagePath && fs.existsSync(imagePath)) {
        attachments.push({
          filename: path.basename(imagePath),
          path: imagePath,
          cid: cid
        });
        imageTag = `<img src="cid:${cid}" alt="${item.productName}" width="60" style="border-radius: 4px;">`;
      }

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0;">${imageTag}</td>
          <td style="padding: 10px; width: 100%;">
            <span style="font-weight: bold;">${item.productName}</span><br>
            <span style="font-size: 14px; color: #777;">Quantità: ${item.quantity}</span>
          </td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">
            ${(item.price * item.quantity).toFixed(2)} €
          </td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: `"Tech Emporium" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Il tuo ordine Tech Emporium #${orderDetails.orderId} è stato confermato!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h1 style="font-size: 24px; color: #181111;">Grazie per il tuo ordine, ${orderDetails.userName}!</h1>
            <p>Abbiamo ricevuto il tuo ordine #${orderDetails.orderId} e lo stiamo preparando per la spedizione.</p>
            <h2 style="font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px;">Riepilogo Ordine</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              ${itemsHtml}
            </table>
            <table style="width: 100%; margin-top: 30px;">
              <tr>
                <td style="text-align: right; font-size: 18px; font-weight: bold;">Totale:</td>
                <td style="text-align: right; font-size: 18px; font-weight: bold; width: 120px;">${orderDetails.totalAmount.toFixed(2)} €</td>
              </tr>
            </table>
            <div style="text-align: center; margin-top: 40px;">
              <a href="http://localhost:4200/orders/${orderDetails.orderId}" style="background-color: #181111; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Traccia il tuo Ordine</a>
            </div>
          </div>
        </div>
      `,
      attachments: attachments 
    };

    try {
      console.log('[Email Debug] Sending email with options:', JSON.stringify(mailOptions, null, 2));
      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent successfully.');
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  }
};

module.exports = emailService;