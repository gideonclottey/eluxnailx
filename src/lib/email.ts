import nodemailer from 'nodemailer'

interface BookingEmailData {
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  notes?: string | null
  serviceName: string
  startAt: Date
  endAt: Date
}

export async function sendBookingEmail(data: BookingEmailData) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    // Use SSL for port 465, STARTTLS for everything else
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const tz = process.env.TIMEZONE ?? 'UTC'

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })

  const subject = `New Nail Appointment: ${data.customerName} – ${fmtDate(data.startAt)} ${fmtTime(data.startAt)}`

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #2d2d2d;">
      <h2 style="color: #d4688e; border-bottom: 2px solid #f4d0dc; padding-bottom: 8px;">💅 New Appointment Booked</h2>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; width: 120px;">Service</td>
          <td style="padding: 8px 0;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Date</td>
          <td style="padding: 8px 0;">${fmtDate(data.startAt)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Time</td>
          <td style="padding: 8px 0;">${fmtTime(data.startAt)} – ${fmtTime(data.endAt)}</td>
        </tr>
      </table>

      <h3 style="color: #d4688e;">Client Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; width: 120px;">Name</td>
          <td style="padding: 8px 0;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Email</td>
          <td style="padding: 8px 0;">${data.customerEmail}</td>
        </tr>
        ${data.customerPhone ? `<tr><td style="padding: 8px 0; font-weight: 600;">Phone</td><td style="padding: 8px 0;">${data.customerPhone}</td></tr>` : ''}
        ${data.notes ? `<tr><td style="padding: 8px 0; font-weight: 600; vertical-align: top;">Notes</td><td style="padding: 8px 0;">${data.notes}</td></tr>` : ''}
      </table>
    </div>
  `

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject,
    html,
  })
}
