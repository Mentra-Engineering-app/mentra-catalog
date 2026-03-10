import { Resend } from 'resend'
import sgMail from '@sendgrid/mail'

let provider = null

function getProvider() {
  if (provider) return provider

  const name = (process.env.EMAIL_PROVIDER || process.env.CATALOG_EMAIL_PROVIDER || 'resend').toLowerCase()

  if (name === 'sendgrid') {
    const apiKey = process.env.SENDGRID_API_KEY || process.env.CATALOG_SENDGRID_API_KEY
    if (!apiKey) throw new Error('SENDGRID_API_KEY is not set')
    sgMail.setApiKey(apiKey)
    provider = {
      name: 'sendgrid',
      send: async ({ from, to, subject, html }) => {
        await sgMail.send({
          to: Array.isArray(to) ? to : [to],
          from,
          subject,
          html,
        })
        return { success: true }
      },
    }
  } else {
    const apiKey = process.env.RESEND_API_KEY || process.env.CATALOG_RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is not set')
    const resend = new Resend(apiKey)
    provider = {
      name: 'resend',
      send: async ({ from, to, subject, html }) => {
        const { data, error } = await resend.emails.send({ from, to, subject, html })
        if (error) throw new Error(error.message)
        return { success: true, data }
      },
    }
  }

  return provider
}

export function isEmailConfigured() {
  const name = (process.env.EMAIL_PROVIDER || process.env.CATALOG_EMAIL_PROVIDER || 'resend').toLowerCase()
  if (name === 'sendgrid') return !!(process.env.SENDGRID_API_KEY || process.env.CATALOG_SENDGRID_API_KEY)
  return !!(process.env.RESEND_API_KEY || process.env.CATALOG_RESEND_API_KEY)
}

export async function sendEmail({ to, subject, html }) {
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.CATALOG_EMAIL_FROM_ADDRESS || 'notifications@mentra-train.ai'
  const fromName = process.env.EMAIL_FROM_NAME || process.env.CATALOG_EMAIL_FROM_NAME || 'Mentra Video Catalog'
  const p = getProvider()

  const from = p.name === 'sendgrid'
    ? { name: fromName, email: fromEmail }
    : `${fromName} <${fromEmail}>`

  return p.send({ from, to, subject, html })
}
