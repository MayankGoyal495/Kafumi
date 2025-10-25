// Mock OTP Service for demo purposes
// In production, you would integrate with:
// - Firebase Phone Auth for phone OTPs
// - SendGrid, AWS SES, or similar for email OTPs
// - Twilio for SMS OTPs

// Mock OTP storage (in production, this would be in your backend database)
const otpStorage = new Map()

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP to phone number
export async function sendPhoneOTP(phoneNumber) {
  try {
    const otp = generateOTP()
    
    // Store OTP with expiry (5 minutes)
    otpStorage.set(phoneNumber, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    })

    // In production, you would integrate with SMS service like Twilio
    console.log(`📱 SMS OTP sent to ${phoneNumber}: ${otp}`)
    
    // For demo purposes, show alert
    if (typeof window !== 'undefined') {
      alert(`Demo: SMS OTP sent to ${phoneNumber}\nOTP: ${otp}\n(This is just for demo - in production, this would be sent via SMS)`)
    }

    return { success: true, message: "OTP sent successfully" }
  } catch (error) {
    console.error("Error sending phone OTP:", error)
    return { success: false, error: "Failed to send OTP" }
  }
}

// Send OTP to email
export async function sendEmailOTP(email) {
  try {
    const otp = generateOTP()
    
    // Store OTP with expiry (5 minutes)
    otpStorage.set(email, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    })

    // In production, you would integrate with email service like SendGrid
    console.log(`📧 Email OTP sent to ${email}: ${otp}`)
    
    // For demo purposes, show alert
    if (typeof window !== 'undefined') {
      alert(`Demo: Email OTP sent to ${email}\nOTP: ${otp}\n(This is just for demo - in production, this would be sent via email)`)
    }

    return { success: true, message: "OTP sent successfully" }
  } catch (error) {
    console.error("Error sending email OTP:", error)
    return { success: false, error: "Failed to send OTP" }
  }
}

// Verify OTP
export async function verifyOTP(identifier, inputOTP) {
  try {
    const stored = otpStorage.get(identifier)
    
    if (!stored) {
      return { success: false, error: "OTP not found or expired" }
    }

    // Check if OTP is expired
    if (Date.now() > stored.expiry) {
      otpStorage.delete(identifier)
      return { success: false, error: "OTP has expired" }
    }

    // Check attempt limit (3 attempts)
    if (stored.attempts >= 3) {
      otpStorage.delete(identifier)
      return { success: false, error: "Too many failed attempts. Please request a new OTP." }
    }

    // Verify OTP
    if (stored.otp === inputOTP) {
      otpStorage.delete(identifier) // Remove OTP after successful verification
      return { success: true, message: "OTP verified successfully" }
    } else {
      // Increment failed attempts
      stored.attempts++
      otpStorage.set(identifier, stored)
      
      const remainingAttempts = 3 - stored.attempts
      return { 
        success: false, 
        error: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
      }
    }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return { success: false, error: "Failed to verify OTP" }
  }
}

// Resend OTP (with rate limiting)
const resendCooldown = new Map()

export async function resendOTP(identifier, method) {
  try {
    // Check rate limiting (max 3 resends per 10 minutes)
    const now = Date.now()
    const lastResend = resendCooldown.get(identifier)
    
    if (lastResend && (now - lastResend) < 10 * 60 * 1000) { // 10 minutes
      return { success: false, error: "Please wait before requesting another OTP" }
    }

    // Update resend timestamp
    resendCooldown.set(identifier, now)

    // Send new OTP
    if (method === 'phone') {
      return await sendPhoneOTP(identifier)
    } else if (method === 'email') {
      return await sendEmailOTP(identifier)
    } else {
      return { success: false, error: "Invalid method" }
    }
  } catch (error) {
    console.error("Error resending OTP:", error)
    return { success: false, error: "Failed to resend OTP" }
  }
}

// Clean up expired OTPs (call this periodically)
export function cleanupExpiredOTPs() {
  const now = Date.now()
  for (const [identifier, data] of otpStorage.entries()) {
    if (now > data.expiry) {
      otpStorage.delete(identifier)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)
}

