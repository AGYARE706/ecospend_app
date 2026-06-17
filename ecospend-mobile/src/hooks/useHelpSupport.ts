import { useCallback, useMemo, useState } from 'react';
import { Linking } from 'react-native';

import { MOCK_SAVE_DELAY_MS } from '../data/mock/mockData';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SupportLinkItem {
  id: string;
  title: string;
  subtitle: string;
  icon: 'mail-outline' | 'bug-outline' | 'document-text-outline' | 'reader-outline';
  iconColor: string;
  iconBackground: string;
  action: 'contact' | 'report' | 'privacy' | 'terms';
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'what-is-ecospend',
    question: 'What is EcoSpend?',
    answer:
      'EcoSpend helps you track spending, set savings goals, and grow money through personal and group vaults. It is built for everyday money management in Ghana.',
  },
  {
    id: 'savings-goals',
    question: 'How do savings goals work?',
    answer:
      'Create a goal with a target amount and optional deadline. Add money over time and track progress with weekly targets. Completed goals move to your history automatically.',
  },
  {
    id: 'vaults',
    question: 'What are personal vaults?',
    answer:
      'Vaults let you lock savings until a maturity date. They are useful for disciplined saving with clear timelines and optional early withdrawal rules.',
  },
  {
    id: 'group-vaults',
    question: 'How do group vaults work?',
    answer:
      'Group vaults let multiple people save together. Members contribute toward a shared target, and withdrawal requests may require group approval before funds are released.',
  },
  {
    id: 'ecospend-plus',
    question: 'What does EcoSpend Plus include?',
    answer:
      'EcoSpend Plus unlocks full vault access, group vaults, priority notifications, and vault analytics for GHS 36 per year.',
  },
  {
    id: 'data-security',
    question: 'Is my financial data secure?',
    answer:
      'EcoSpend uses secure sign-in, optional two-factor authentication, and encrypted connections. You can review active sessions and sign out remotely from Security settings.',
  },
];

const SUPPORT_EMAIL = 'support@ecospend.app';

export function useHelpSupport() {
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);

  const [issueSubject, setIssueSubject] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueErrors, setIssueErrors] = useState<{
    subject?: string;
    description?: string;
  }>({});
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [issueSuccessMessage, setIssueSuccessMessage] = useState<string | null>(null);

  const supportLinks = useMemo<SupportLinkItem[]>(
    () => [
      {
        id: 'contact',
        title: 'Contact Support',
        subtitle: 'Email our team for account help',
        icon: 'mail-outline',
        iconColor: '#1565C0',
        iconBackground: '#E3F2FD',
        action: 'contact',
      },
      {
        id: 'report',
        title: 'Report Issue',
        subtitle: 'Tell us about bugs or app problems',
        icon: 'bug-outline',
        iconColor: '#F57F17',
        iconBackground: '#FFF8E1',
        action: 'report',
      },
      {
        id: 'privacy',
        title: 'Privacy Policy',
        subtitle: 'How we collect and use your data',
        icon: 'document-text-outline',
        iconColor: '#2E7D32',
        iconBackground: '#F1F8E9',
        action: 'privacy',
      },
      {
        id: 'terms',
        title: 'Terms of Service',
        subtitle: 'Rules for using EcoSpend',
        icon: 'reader-outline',
        iconColor: '#6A1B9A',
        iconBackground: '#F3E5F5',
        action: 'terms',
      },
    ],
    [],
  );

  const toggleFaq = useCallback((id: string) => {
    setExpandedFaqId((current) => (current === id ? null : id));
  }, []);

  const handleContactSupport = useCallback(async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('EcoSpend Support Request')}`;
    await Linking.openURL(url);
  }, []);

  const openReportSheet = useCallback(() => {
    setIssueSubject('');
    setIssueDescription('');
    setIssueErrors({});
    setShowReportSheet(true);
  }, []);

  const closeReportSheet = useCallback(() => {
    setShowReportSheet(false);
  }, []);

  const openPrivacySheet = useCallback(() => {
    setShowPrivacySheet(true);
  }, []);

  const closePrivacySheet = useCallback(() => {
    setShowPrivacySheet(false);
  }, []);

  const openTermsSheet = useCallback(() => {
    setShowTermsSheet(true);
  }, []);

  const closeTermsSheet = useCallback(() => {
    setShowTermsSheet(false);
  }, []);

  const handleSupportLinkPress = useCallback(
    (action: SupportLinkItem['action']) => {
      switch (action) {
        case 'contact':
          void handleContactSupport();
          break;
        case 'report':
          openReportSheet();
          break;
        case 'privacy':
          openPrivacySheet();
          break;
        case 'terms':
          openTermsSheet();
          break;
        default:
          break;
      }
    },
    [handleContactSupport, openPrivacySheet, openReportSheet, openTermsSheet],
  );

  const validateIssueForm = useCallback((): boolean => {
    const errors: { subject?: string; description?: string } = {};

    if (!issueSubject.trim()) {
      errors.subject = 'Enter a short subject';
    }

    if (issueDescription.trim().length < 10) {
      errors.description = 'Describe the issue in at least 10 characters';
    }

    setIssueErrors(errors);
    return Object.keys(errors).length === 0;
  }, [issueDescription, issueSubject]);

  const handleSubmitIssue = useCallback(async () => {
    if (!validateIssueForm()) {
      return;
    }

    setIsSubmittingIssue(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));

    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `[Issue] ${issueSubject.trim()}`,
    )}&body=${encodeURIComponent(issueDescription.trim())}`;

    setIsSubmittingIssue(false);
    setShowReportSheet(false);
    setIssueSuccessMessage('Issue report prepared. Your email app will open to send it.');
    await Linking.openURL(mailUrl);
  }, [issueDescription, issueSubject, validateIssueForm]);

  const dismissIssueSuccess = useCallback(() => {
    setIssueSuccessMessage(null);
  }, []);

  return {
    faqItems: FAQ_ITEMS,
    supportLinks,
    expandedFaqId,
    showReportSheet,
    showPrivacySheet,
    showTermsSheet,
    issueSubject,
    issueDescription,
    issueErrors,
    isSubmittingIssue,
    issueSuccessMessage,
    setIssueSubject,
    setIssueDescription,
    toggleFaq,
    handleSupportLinkPress,
    closeReportSheet,
    closePrivacySheet,
    closeTermsSheet,
    handleSubmitIssue,
    dismissIssueSuccess,
    supportEmail: SUPPORT_EMAIL,
  };
}

export const PRIVACY_POLICY_TEXT = `Privacy Policy

Last updated: June 2026

EcoSpend respects your privacy. This policy explains what information we collect, how we use it, and the choices you have.

Information we collect
• Account details such as your name and phone number
• Financial activity you enter in the app, including transactions, goals, and vaults
• Device and usage data needed to secure your account and improve the app

How we use information
• Provide budgeting, goals, vault, and calculator features
• Send notifications you opt into
• Protect against fraud and unauthorized access
• Improve product performance and support

Sharing
We do not sell your personal data. We may share limited information with service providers who help us operate EcoSpend, subject to confidentiality obligations.

Your choices
You can update profile details, manage notification preferences, review active sessions, and request account deletion from the app settings.

Contact
Questions about privacy can be sent to support@ecospend.app.`;

export const TERMS_OF_SERVICE_TEXT = `Terms of Service

Last updated: June 2026

By using EcoSpend, you agree to these terms.

Using EcoSpend
EcoSpend provides personal finance tools for tracking spending, savings goals, and vault features. You are responsible for the accuracy of information you enter.

Accounts and security
Keep your login details secure. Notify us promptly if you suspect unauthorized access to your account.

Subscriptions
EcoSpend Plus is billed annually unless cancelled according to in-app instructions. Feature availability may change over time.

Acceptable use
Do not misuse the app, attempt unauthorized access, or use EcoSpend for unlawful activity.

Disclaimers
EcoSpend is a financial organization tool, not a bank. Balances and projections depend on data you provide and are for informational purposes.

Changes
We may update these terms. Continued use after changes means you accept the revised terms.

Contact
For questions about these terms, email support@ecospend.app.`;
