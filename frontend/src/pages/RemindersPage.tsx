import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReminderRule, NotificationChannel, SupportedLanguage } from '../types';
import { Button } from '../components/ui/Button';
import { formatKolkataDate, formatRupees } from '../utils/formatters';
import { BellRing, Plus, Send, Clock, CheckCircle2, ShieldAlert, MessageSquare } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const RemindersPage: React.FC<{ onOpenSendReminder: () => void }> = ({
  onOpenSendReminder,
}) => {
  const { reminderRules, notificationLogs, currentOrg, showToast } = useApp();

  const [rules, setRules] = useState<ReminderRule[]>(reminderRules);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);

  // New rule state
  const [ruleName, setRuleName] = useState('');
  const [channel, setChannel] = useState<NotificationChannel>('WHATSAPP');
  const [offsetDays, setOffsetDays] = useState<number>(-3);
  const [sendTime, setSendTime] = useState<string>('10:00');
  const [ruleLang, setRuleLang] = useState<SupportedLanguage>('en');

  const toggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
    showToast('Reminder rule schedule toggled', 'info');
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: ReminderRule = {
      id: `rule-${Date.now()}`,
      organizationId: currentOrg.id,
      name: ruleName || `Rule (${offsetDays >= 0 ? `+${offsetDays}` : offsetDays} Days)`,
      channel,
      offsetDays,
      sendTime,
      language: ruleLang,
      templateCode: 'CUSTOM_TEMPLATE',
      isActive: true,
    };
    setRules((prev) => [...prev, newRule]);
    setShowAddRuleModal(false);
    showToast('New automated reminder cadence added to Redis queue engine', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Reminder Automation Engine
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Multi-channel scheduled cadence (WhatsApp Business, SMS, Voice Calls, Email) in English, Hindi, and Marathi.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            icon={<Send size={16} />}
            onClick={onOpenSendReminder}
          >
            Dispatch Immediate Reminder
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setShowAddRuleModal(true)}
          >
            Add Scheduled Rule
          </Button>
        </div>
      </div>

      {/* Compliance / Quiet Hours Banner */}
      <div className="p-4 bg-ground rounded-[14px] border border-line flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface rounded-lg border border-line text-paid">
            <ShieldAlert size={18} />
          </div>
          <div>
            <span className="font-bold text-ink block">TRAI & RBI Compliance Guard</span>
            <span className="text-muted-text">
              Strict quiet hours enforced: 9:00 PM to 8:00 AM IST. Daily message cap: 1 per tenant. Recorded payments automatically dequeue and cancel pending reminder jobs.
            </span>
          </div>
        </div>
      </div>

      {/* Active Rules List */}
      <div className="ledger-card">
        <h3 className="ledger-card-title">Scheduled Automation Rules</h3>
        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Cadence Rule Name</th>
                <th>Channel</th>
                <th>Trigger Offset</th>
                <th>Dispatch Time</th>
                <th>Default Language</th>
                <th>Engine Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="font-bold text-ink">{rule.name}</td>
                  <td>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-ground">
                      {rule.channel}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        rule.offsetDays < 0
                          ? 'bg-due/10 text-due'
                          : rule.offsetDays === 0
                          ? 'bg-paid/10 text-paid'
                          : 'bg-overdue/10 text-overdue'
                      }`}
                    >
                      {rule.offsetDays < 0
                        ? `${Math.abs(rule.offsetDays)} Days Before Due`
                        : rule.offsetDays === 0
                        ? 'On Due Day'
                        : `${rule.offsetDays} Days Overdue`}
                    </span>
                  </td>
                  <td className="font-mono text-xs">{rule.sendTime} IST</td>
                  <td className="uppercase text-xs font-semibold">{rule.language}</td>
                  <td>
                    <span
                      className={`text-xs font-semibold inline-flex items-center gap-1 ${
                        rule.isActive ? 'text-paid' : 'text-muted-text'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          rule.isActive ? 'bg-paid' : 'bg-muted-text'
                        }`}
                      />
                      {rule.isActive ? 'Active in Queue' : 'Paused'}
                    </span>
                  </td>
                  <td className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleRuleActive(rule.id)}
                    >
                      {rule.isActive ? 'Pause' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Activity Logs */}
      <div className="ledger-card">
        <h3 className="ledger-card-title">Notification Delivery Logs</h3>
        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Phone / Email</th>
                <th>Channel</th>
                <th>Timestamp (IST)</th>
                <th>Status</th>
                <th>Telecom Cost</th>
              </tr>
            </thead>
            <tbody>
              {notificationLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-semibold">{log.recipientName}</td>
                  <td className="text-xs font-mono">{log.recipientPhoneOrEmail}</td>
                  <td>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-ground">
                      {log.channel}
                    </span>
                  </td>
                  <td className="text-xs text-muted-text">
                    {formatKolkataDate(log.sentAt, true)}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-xs text-paid font-semibold">
                      <CheckCircle2 size={13} /> {log.status}
                    </span>
                  </td>
                  <td className="font-mono text-xs">{log.costPaise} paise</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      <Modal
        isOpen={showAddRuleModal}
        onClose={() => setShowAddRuleModal(false)}
        title="Add Scheduled Reminder Cadence"
        subtitle="Automated cron job for Redis background queue"
      >
        <form onSubmit={handleAddRule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Rule Name
            </label>
            <input
              type="text"
              required
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g. 3 Days Pre-Due Friendly Reminder"
              className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as NotificationChannel)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              >
                <option value="WHATSAPP">WhatsApp Business</option>
                <option value="SMS">SMS Gateway</option>
                <option value="VOICE">Automated Voice Call</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Day Offset (Negative = Before, Positive = After)
              </label>
              <input
                type="number"
                value={offsetDays}
                onChange={(e) => setOffsetDays(parseInt(e.target.value) || 0)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Dispatch Time (IST)
              </label>
              <input
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Language
              </label>
              <select
                value={ruleLang}
                onChange={(e) => setRuleLang(e.target.value as SupportedLanguage)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-line">
            <Button variant="secondary" type="button" onClick={() => setShowAddRuleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
