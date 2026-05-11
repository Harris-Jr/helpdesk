import React, { useEffect, useState } from 'react';
import { ChatbotConfig, ChatbotFAQ, ChatLog } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import SettingsSection from '@/components/settings/SettingsSection';
import ToggleRow from '@/components/settings/ToggleRow';
import { Trash2, Plus, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminChatbotTab() {
  const [config, setConfig] = useState(null);
  const [configSaved, setConfigSaved] = useState(false);

  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [faqError, setFaqError] = useState('');

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState('all'); // all | unresolved

  useEffect(() => {
    loadConfig();
    loadFaqs();
    loadLogs();
  }, []);

  const loadConfig = async () => {
    try {
      const list = await ChatbotConfig.list();
      if (list?.[0]) setConfig(list[0]);
      else {
        // Create default
        const defaultCfg = {
          enabled: true,
          welcome_message: 'Hi! 👋 I\'m the OAG Helpdesk assistant. How can I help?',
          fallback_message: "I'm not sure — would you like to create a ticket?",
          use_knowledge_base: true,
          notify_admin_on_unresolved: true,
        };
        const created = await ChatbotConfig.create(defaultCfg);
        setConfig(created);
      }
    } catch {}
  };

  const loadFaqs = async () => {
    try { setFaqs(await ChatbotFAQ.list('-created_date', 100) || []); } catch {}
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      setLogs(await ChatLog.list('-updated_date', 50) || []);
    } catch { setLogs([]); }
    setLogsLoading(false);
  };

  const saveConfig = async (patch) => {
    if (!config) return;
    const next = { ...config, ...patch };
    setConfig(next);
    try {
      await ChatbotConfig.update(config.id, patch);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2000);
    } catch {}
  };

  const addFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      setFaqError('Question and answer are required.');
      return;
    }
    setFaqError('');
    try {
      await ChatbotFAQ.create({
        question: newFaq.question.trim(),
        answer: newFaq.answer.trim(),
        enabled: true,
      });
      setNewFaq({ question: '', answer: '' });
      loadFaqs();
    } catch { setFaqError('Failed to add FAQ.'); }
  };

  const deleteFaq = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    try { await ChatbotFAQ.delete(id); loadFaqs(); } catch {}
  };

  const toggleFaq = async (faq) => {
    try {
      await ChatbotFAQ.update(faq.id, { enabled: !faq.enabled });
      loadFaqs();
    } catch {}
  };

  const filteredLogs = logs.filter((l) => logFilter === 'all' || !l.resolved);

  if (!config) return <p className="text-sm text-gray-400">Loading chatbot settings...</p>;

  return (
    <div className="space-y-4">
      {/* General Settings */}
      <SettingsSection title="General Settings">
        <ToggleRow
          label="Enable Chatbot"
          description="Turn the AI assistant on or off across all user pages."
          checked={!!config.enabled}
          onChange={(v) => saveConfig({ enabled: v })}
        />
        <ToggleRow
          label="Use Knowledge Base"
          description="Ground bot answers in published KB articles."
          checked={config.use_knowledge_base !== false}
          onChange={(v) => saveConfig({ use_knowledge_base: v })}
        />
        <ToggleRow
          label="Notify Admin on Unresolved"
          description="Create a notification when the bot can't answer a question."
          checked={config.notify_admin_on_unresolved !== false}
          onChange={(v) => saveConfig({ notify_admin_on_unresolved: v })}
        />

        <div>
          <Label>Welcome Message</Label>
          <Textarea
            value={config.welcome_message || ''}
            onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
            onBlur={() => saveConfig({ welcome_message: config.welcome_message })}
            rows={2}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Fallback Message</Label>
          <Textarea
            value={config.fallback_message || ''}
            onChange={(e) => setConfig({ ...config, fallback_message: e.target.value })}
            onBlur={() => saveConfig({ fallback_message: config.fallback_message })}
            rows={2}
            className="mt-1"
          />
        </div>
        {configSaved && <p className="text-xs text-green-700">Saved ✓</p>}
      </SettingsSection>

      {/* FAQs */}
      <SettingsSection title="FAQs & Training Content">
        <p className="text-sm text-gray-500">
          FAQs are fed to the AI as reference material. They improve answer accuracy for repeated questions.
        </p>

        <div className="space-y-2">
          <Input
            placeholder="Question..."
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
          />
          <Textarea
            placeholder="Answer..."
            rows={2}
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={addFaq} className="bg-green-700 hover:bg-green-800 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add FAQ
            </Button>
            {faqError && <p className="text-xs text-red-500">{faqError}</p>}
          </div>
        </div>

        {faqs.length === 0 ? (
          <p className="text-sm text-gray-400 mt-3">No FAQs yet. Add some to improve bot accuracy.</p>
        ) : (
          <div className="rounded-lg border border-gray-200 overflow-hidden mt-2">
            {faqs.map((f) => (
              <div key={f.id} className="px-4 py-3 border-t first:border-t-0 border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800">{f.question}</p>
                    <p className="text-xs text-gray-600 mt-1">{f.answer}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => toggleFaq(f)} className="h-7 text-xs px-2">
                      {f.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteFaq(f.id)} className="h-7 text-xs px-2 text-red-500 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      {/* Chat Logs */}
      <SettingsSection title="Chat Logs & Monitoring">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Button size="sm" variant={logFilter === 'all' ? 'default' : 'outline'} onClick={() => setLogFilter('all')} className={logFilter === 'all' ? 'bg-green-700 hover:bg-green-800 text-white' : ''}>
              All ({logs.length})
            </Button>
            <Button size="sm" variant={logFilter === 'unresolved' ? 'default' : 'outline'} onClick={() => setLogFilter('unresolved')} className={logFilter === 'unresolved' ? 'bg-green-700 hover:bg-green-800 text-white' : ''}>
              Unresolved ({logs.filter((l) => !l.resolved).length})
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={loadLogs}>Refresh</Button>
        </div>

        {logsLoading ? (
          <p className="text-sm text-gray-400">Loading logs...</p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No chat logs yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <details key={log.id} className="rounded-lg border border-gray-200 bg-white">
                <summary className="px-3 py-2 cursor-pointer text-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium truncate">{log.user_name || log.user_email || 'Anonymous'}</span>
                    <span className="text-xs text-gray-500 truncate">— {log.last_user_question || '(no question)'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {log.resolved ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Resolved</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Unresolved</Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      {log.updated_date ? format(new Date(log.updated_date), 'MMM d HH:mm') : ''}
                    </span>
                  </div>
                </summary>
                <div className="px-3 pb-3 space-y-1.5 bg-gray-50 border-t">
                  {(log.messages || []).map((m, i) => (
                    <div key={i} className={`text-xs p-2 rounded ${m.role === 'user' ? 'bg-green-50 text-gray-800' : 'bg-white border border-gray-100 text-gray-700'}`}>
                      <span className="font-semibold capitalize">{m.role}:</span> {m.content}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
