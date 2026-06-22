import { Request, Response } from "express";
import * as nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Setup email transporter
const createTransporter = () => {
  const mailService = process.env.MAIL_SERVICE || "gmail";
  const mailUser = process.env.MAIL_USER || "";
  const mailPassword = process.env.MAIL_APP_PASSWORD || "";

  if (!mailUser || !mailPassword) {
    console.warn("[Loan] Email credentials not configured");
    return null;
  }

  return nodemailer.createTransport({
    service: mailService,
    auth: {
      user: mailUser,
      pass: mailPassword,
    },
  });
};

interface LoanApplication {
  // Personal Details
  email: string;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  nationality: string;
  passportNumber?: string;

  // Loan Details
  amountNeeded: number;
  currency: string;
  purpose: string;
  repaymentPeriod: number;
  loanType: string; // "Education" | "Personal" | "Business"

  // Employment & Income
  employmentStatus: string;
  employerName?: string;
  jobTitle?: string;
  workExperience: number; // years
  annualIncome?: number;
  monthlyIncome?: number;

  // Education Details (if applicable)
  educationLevel: string;
  fieldOfStudy?: string;
  universityName?: string;
  countryOfStudy?: string;

  // Financial Details
  existingLoans?: number; // total outstanding
  creditScore?: number;
  bankAccountNumber?: string;
  bankName?: string;

  // Co-applicant Details
  hasCoApplicant: boolean;
  coApplicantName?: string;
  coApplicantRelation?: string;
  coApplicantPhone?: string;
  coApplicantIncome?: number;

  // Collateral & Security
  collateralType?: string; // "Property" | "Vehicle" | "Gold" | "None"
  collateralValue?: number;
  guarantorName?: string;
  guarantorPhone?: string;

  // Additional Information
  additionalInfo?: string;
}

export const applyForLoan = async (req: Request, res: Response) => {
  try {
    const data: LoanApplication = req.body;

    // Validate required fields
    if (!data.email || !data.fullName || !data.amountNeeded || !data.purpose) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: email, fullName, amountNeeded, purpose",
      });
      return;
    }

    console.log(`[Loan] Processing application from ${data.email}`);

    // Build email content
const emailContent = `
╔════════════════════════════════════════════════════════════════╗
║             LOAN APPLICATION RECEIVED                          ║
║                Study Abroad Platform                           ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. APPLICANT PERSONAL DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full Name:              ${data.fullName}
Email:                 ${data.email}
Phone:                 ${data.phone}
Date of Birth:         ${data.dateOfBirth}
Nationality:           ${data.nationality}
Passport Number:       ${data.passportNumber || "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. LOAN REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Loan Type:             ${data.loanType}
Amount Requested:      ${data.currency} ${data.amountNeeded}
Purpose:               ${data.purpose}
Repayment Period:      ${data.repaymentPeriod} months
Monthly EMI:           ${data.currency} ${(data.amountNeeded / data.repaymentPeriod).toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. EMPLOYMENT & INCOME DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Employment Status:     ${data.employmentStatus}
Employer Name:         ${data.employerName || "N/A"}
Job Title:             ${data.jobTitle || "N/A"}
Work Experience:       ${data.workExperience} years
Annual Income:         ${data.annualIncome ? `${data.currency} ${data.annualIncome}` : "N/A"}
Monthly Income:        ${data.monthlyIncome ? `${data.currency} ${data.monthlyIncome}` : "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. EDUCATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Education Level:       ${data.educationLevel}
Field of Study:        ${data.fieldOfStudy || "N/A"}
University Name:       ${data.universityName || "N/A"}
Country of Study:      ${data.countryOfStudy || "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. FINANCIAL DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Existing Loans:        ${data.existingLoans ? `${data.currency} ${data.existingLoans}` : "None"}
Credit Score:          ${data.creditScore || "Not provided"}
Bank Account:          ${data.bankAccountNumber ? `****${data.bankAccountNumber.slice(-4)}` : "N/A"}
Bank Name:             ${data.bankName || "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. CO-APPLICANT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${
  data.hasCoApplicant
    ? `Co-Applicant Name:    ${data.coApplicantName}
Co-Applicant Relation: ${data.coApplicantRelation}
Co-Applicant Phone:    ${data.coApplicantPhone}
Co-Applicant Income:   ${data.coApplicantIncome ? `${data.currency} ${data.coApplicantIncome}` : "N/A"}`
    : "No Co-Applicant"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. COLLATERAL & SECURITY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collateral Type:       ${data.collateralType || "None"}
Collateral Value:      ${data.collateralValue ? `${data.currency} ${data.collateralValue}` : "N/A"}
Guarantor Name:        ${data.guarantorName || "N/A"}
Guarantor Phone:       ${data.guarantorPhone || "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. ADDITIONAL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.additionalInfo || "None provided"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUBMISSION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted via:         Study Abroad Platform
Submission Time:       ${new Date().toLocaleString()}
Application ID:        LOAN_${Date.now()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION REQUIRED:
Sir/Ma'am, please review this application and contact the applicant
within 2-3 business days.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    // Send email to sir
    const transporter = createTransporter();
    let emailSent = false;
    let emailError = null;

    if (transporter) {
      try {
        const sirEmail = process.env.MAIL_TO_SIR || "";
        const fromName = process.env.MAIL_FROM_NAME || "Study Abroad Platform";

        await transporter.sendMail({
          from: `${fromName} <${process.env.MAIL_USER}>`,
          to: sirEmail,
          subject: `Loan Application from ${data.fullName}`,
          text: emailContent,
          html: `<pre>${emailContent}</pre>`,
        });

        emailSent = true;
        console.log(`[Loan] Email sent to sir at ${sirEmail}`);
      } catch (err) {
        emailError = String(err);
        console.error("[Loan] Email send error:", err);
      }
    }

    // Create loan application record (optional - for tracking)
    try {
        await prisma.loanApplication.create({
                data: {
                email: data.email,
                fullName: data.fullName,
                dateOfBirth: data.dateOfBirth,
                phone: data.phone,
                nationality: data.nationality,
                passportNumber: data.passportNumber ?? null,
                
                amountNeeded: data.amountNeeded,
                currency: data.currency,
                purpose: data.purpose,
                repaymentPeriod: data.repaymentPeriod,
                loanType: data.loanType,
                
                employmentStatus: data.employmentStatus,
                employerName: data.employerName ?? null,
                jobTitle: data.jobTitle ?? null,
                workExperience: data.workExperience,
                annualIncome: data.annualIncome ?? null,
                monthlyIncome: data.monthlyIncome ?? null,
                
                educationLevel: data.educationLevel,
                fieldOfStudy: data.fieldOfStudy ?? null,
                universityName: data.universityName ?? null,
                countryOfStudy: data.countryOfStudy ?? null,
                
                existingLoans: data.existingLoans ?? null,
                creditScore: data.creditScore ?? null,
                bankAccountNumber: data.bankAccountNumber ?? null,
                bankName: data.bankName ?? null,
                
                hasCoApplicant: data.hasCoApplicant,
                coApplicantName: data.coApplicantName ?? null,
                coApplicantRelation: data.coApplicantRelation ?? null,
                coApplicantPhone: data.coApplicantPhone ?? null,
                coApplicantIncome: data.coApplicantIncome ?? null,
                
                collateralType: data.collateralType ?? null,
                collateralValue: data.collateralValue ?? null,
                guarantorName: data.guarantorName ?? null,
                guarantorPhone: data.guarantorPhone ?? null,
                
                additionalInfo: data.additionalInfo ?? null,
                emailSent,
                emailError: emailError ?? null,
                },
            });
    } catch (dbErr) {
      console.log("[Loan] Database save skipped (table may not exist yet)");
    }

    res.json({
      success: true,
      message: "Loan application received successfully",
      emailSent,
      applicationId: `LOAN_${Date.now()}`,
      nextSteps: "Sir will review your application and contact you shortly",
    });
  } catch (error) {
    console.error("[Loan] Error:", error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
};

// Get loan application status (optional)
export const getLoanStatus = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email required",
      });
      return;
    }

    try {
      const applications = await prisma.loanApplication.findMany({
        where: { email: String(email) },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      res.json({
        success: true,
        applications: applications.map((app) => ({
          id: app.id,
          amount: app.amountNeeded,
          currency: app.currency,
          purpose: app.purpose,
          status: app.emailSent ? "Submitted to Officer" : "Error in submission",
          appliedAt: app.createdAt,
        })),
      });
    } catch (dbErr) {
      res.json({
        success: false,
        message: "Database not configured yet",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
};

export default {
  applyForLoan,
  getLoanStatus,
};