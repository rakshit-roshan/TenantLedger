import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Unit, NotificationChannel, SupportedLanguage } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupees, formatKolkataDate } from '../../utils/formatters';
import { Send, MessageSquare, PhoneCall, Mail, Smartphone } from 'lucide-react';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUnit?: Unit | null;
}

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  isOpen,
  onClose,
  targetUnit,
}) => {
  const { units, currentOrg, sendReminderNow } = useApp();

  const occupiedUnits = units.filter((u) => u.currentTenantName);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    targetUnit?.id || (occupiedUnits[0]?.id ?? '')
  );
  const [channel, setChannel] = useState<NotificationChannel>('WHATSAPP');
  const [lang, setLang] = useState<SupportedLanguage>('en');

  const unit = units.find((u) => u.id === selectedUnitId) || targetUnit;

  const dueAmount = unit
    ? formatRupees(unit.amountDuePaise || unit.baseRentPaise + unit.maintenancePaise)
    : '₹0';
  const tenantName = unit?.currentTenantName || 'Tenant';
  const unitNum = unit?.unitNumber || '101';
  const paymentLink = `https://pay.gharkhata.in/l/${unit?.id || 'demo'}`;

  // Approved templates in English, Hindi, and Marathi
  const getTemplateMessage = () => {
    if (lang === 'hi') {
      switch (channel) {
        case 'WHATSAPP':
          return `नमस्ते ${tenantName} जी,\n\nयह ${currentOrg.name} की ओर से याद दिलाने के लिए संदेश है। आपके यूनिट ${unitNum} का किराया ${dueAmount} देय है।\n\nकृपया इस लिंक से तुरंत सुरक्षित भुगतान करें:\n${paymentLink}\n\nधन्यवाद,\nघरखाता सेवा`;
        case 'SMS':
          return `घरखाता: आदरणीय ${tenantName}, यूनिट ${unitNum} का किराया ${dueAmount} देय है। भुगतान लिंक: ${paymentLink} - ${currentOrg.code}`;
        case 'VOICE':
          return `[ऑटोमेटेड वॉइस कॉल - हिन्दी] "नमस्ते ${tenantName} जी। यह ${currentOrg.name} से एक स्वचालित सूचना कॉल है। आपके यूनिट संख्या ${unitNum} का मासिक किराया ${dueAmount} देय है। कृपया इसे आज ही जमा कराएं। धन्यवाद।"`;
        case 'EMAIL':
        default:
          return `विषय: यूनिट ${unitNum} किराया देय सूचना - ${currentOrg.name}\n\nप्रिय ${tenantName},\n\nकृपया अवगत रहें कि यूनिट ${unitNum} के लिए मासिक किराया ${dueAmount} नियत तिथि पर देय है। कृपया नीचे दिए गए लिंक के माध्यम से रसीद प्राप्त करें और भुगतान पूरा करें:\n${paymentLink}`;
      }
    } else if (lang === 'mr') {
      switch (channel) {
        case 'WHATSAPP':
          return `नमस्कार ${tenantName},\n\n${currentOrg.name} कडून नम्र विनंती. आपल्या युनिट ${unitNum} चे भाडे ${dueAmount} देय आहे.\n\nकृपया खालील लिंकवर त्वरित सुरक्षितपणे भाडे भरा:\n${paymentLink}\n\nआपले नम्र,\nघरखाते व्यवस्थापन`;
        case 'SMS':
          return `घरखाते: नमस्कार ${tenantName}, युनिट ${unitNum} चे भाडे ${dueAmount} देय आहे. भरण्यासाठी लिंक: ${paymentLink}`;
        case 'VOICE':
          return `[ऑटोमेटेड व्हॉइस कॉल - मराठी] "नमस्कार ${tenantName}. ही ${currentOrg.name} कडून स्वयंचलित सूचना आहे. आपल्या युनिट क्रमांक ${unitNum} चे भाडे ${dueAmount} येणे बाकी आहे. कृपया त्वरित जमा करावे. धन्यवाद."`;
        case 'EMAIL':
        default:
          return `विषय: युनिट ${unitNum} भाडे देय सूचना - ${currentOrg.name}\n\nनमस्कार ${tenantName},\n\nआपल्या फ्लॅट/युनिट ${unitNum} चे मासिक भाडे ${dueAmount} देय झाले आहे. कृपया त्वरित भरणा करावा:\n${paymentLink}`;
      }
    } else {
      // English
      switch (channel) {
        case 'WHATSAPP':
          return `Namaste ${tenantName},\n\nThis is a gentle reminder from ${currentOrg.name}. The rent for Unit ${unitNum} amounting to ${dueAmount} is due.\n\nPlease pay securely via this link:\n${paymentLink}\n\nOfficial receipt will be generated instantly upon payment.\nThank you!`;
        case 'SMS':
          return `GHARKHATA: Dear ${tenantName}, rent of ${dueAmount} for Unit ${unitNum} is due. Settle instantly via UPI: ${paymentLink}`;
        case 'VOICE':
          return `[Automated Voice Call - English] "Hello ${tenantName}. This is an automated reminder call from ${currentOrg.name}. Your monthly rent of ${dueAmount} for Unit ${unitNum} is due. Please settle via the payment link sent to your phone. Thank you."`;
        case 'EMAIL':
        default:
          return `Subject: Rent Payment Due Reminder for Unit ${unitNum} - ${currentOrg.name}\n\nDear ${tenantName},\n\nWe hope this email finds you well. This is a reminder that the monthly rent & maintenance of ${dueAmount} for Unit ${unitNum} is now due.\n\nPayment Link: ${paymentLink}\n\nWarm regards,\n${currentOrg.name} Accounts Team`;
      }
    }
  };

  const handleSend = () => {
    if (!unit) return;
    sendReminderNow(unit.id, channel);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Payment Reminder"
      subtitle="Dispatched via verified telecom & WhatsApp Business gateway"
    >
      <div className="space-y-5">
        {/* Unit Selector */}
        <div>
          <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
            Target Unit & Tenant
          </label>
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            {occupiedUnits.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.unitNumber} ({u.buildingName}) - {u.currentTenantName} [{formatRupees(u.amountDuePaise || u.baseRentPaise + u.maintenancePaise)}]
              </option>
            ))}
          </select>
        </div>

        {/* Channel Selection Buttons */}
        <div>
          <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
            Notification Channel
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setChannel('WHATSAPP')}
              className={`min-h-[44px] px-2 rounded-[10px] border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                channel === 'WHATSAPP'
                  ? 'bg-paid text-white border-paid shadow-sm'
                  : 'bg-surface text-ink border-line hover:bg-ground'
              }`}
            >
              <MessageSquare size={14} />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setChannel('SMS')}
              className={`min-h-[44px] px-2 rounded-[10px] border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                channel === 'SMS'
                  ? 'bg-terracotta text-white border-terracotta shadow-sm'
                  : 'bg-surface text-ink border-line hover:bg-ground'
              }`}
            >
              <Smartphone size={14} />
              SMS
            </button>
            <button
              type="button"
              onClick={() => setChannel('VOICE')}
              className={`min-h-[44px] px-2 rounded-[10px] border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                channel === 'VOICE'
                  ? 'bg-due text-white border-due shadow-sm'
                  : 'bg-surface text-ink border-line hover:bg-ground'
              }`}
            >
              <PhoneCall size={14} />
              Voice Call
            </button>
            <button
              type="button"
              onClick={() => setChannel('EMAIL')}
              className={`min-h-[44px] px-2 rounded-[10px] border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                channel === 'EMAIL'
                  ? 'bg-ink text-white border-ink shadow-sm'
                  : 'bg-surface text-ink border-line hover:bg-ground'
              }`}
            >
              <Mail size={14} />
              Email
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
            Message Language
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`flex-1 min-h-[40px] rounded-[10px] border text-xs font-semibold transition-colors ${
                lang === 'en'
                  ? 'bg-ink text-white border-ink'
                  : 'bg-surface text-ink border-line hover:bg-ground'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`flex-1 min-h-[40px] rounded-[10px] border text-xs font-semibold transition-colors ${
                lang === 'hi'
                  ? 'bg-ink text-white border-ink'
                  : 'bg-surface text-ink border-line hover:bg-ground'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => setLang('mr')}
              className={`flex-1 min-h-[40px] rounded-[10px] border text-xs font-semibold transition-colors ${
                lang === 'mr'
                  ? 'bg-ink text-white border-ink'
                  : 'bg-surface text-ink border-line hover:bg-ground'
              }`}
            >
              मराठी (Marathi)
            </button>
          </div>
        </div>

        {/* Live Message Preview */}
        <div>
          <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Live Message Preview</span>
            <span className="text-[10px] text-paid font-normal">Approved Template</span>
          </label>
          <div className="p-4 rounded-[12px] bg-ground border border-line font-mono text-xs text-ink whitespace-pre-wrap leading-relaxed shadow-inner">
            {getTemplateMessage()}
          </div>
          <p className="text-[11px] text-muted-text mt-1.5">
            Rules enforce quiet hours (9:00 PM – 8:00 AM) and maximum 1 dispatch per day per tenant.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-3 flex justify-end gap-3 border-t border-line">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Send size={15} />}
            onClick={handleSend}
          >
            Dispatch Reminder Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};

