import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MessageSquare, Mail, Phone, Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function Integrations() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', content: '' });
  const [smsForm, setSmsForm] = useState({ to: '', message: '' });
  const [whatsappForm, setWhatsappForm] = useState({ to: '', message: '' });
  const [aiForm, setAiForm] = useState({ recipient: '', context: '' });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/integrations/status');
      setStatus(response.data);
    } catch (error) {
      toast.error('Failed to load integration status');
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    try {
      await api.post('/communication/email', null, {
        params: {
          to_email: emailForm.to,
          subject: emailForm.subject,
          html_content: `<p>${emailForm.content}</p>`
        }
      });
      toast.success('Email sent successfully!');
      setOpenDialog('');
      setEmailForm({ to: '', subject: '', content: '' });
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const sendSMS = async () => {
    try {
      await api.post('/communication/sms', null, {
        params: { to_number: smsForm.to, message: smsForm.message }
      });
      toast.success('SMS sent successfully!');
      setOpenDialog('');
      setSmsForm({ to: '', message: '' });
    } catch (error) {
      toast.error('Failed to send SMS');
    }
  };

  const sendWhatsApp = async () => {
    try {
      await api.post('/communication/whatsapp', null, {
        params: { to_number: whatsappForm.to, message: whatsappForm.message }
      });
      toast.success('WhatsApp message sent!');
      setOpenDialog('');
      setWhatsappForm({ to: '', message: '' });
    } catch (error) {
      toast.error('Failed to send WhatsApp message');
    }
  };

  const generateEmailDraft = async () => {
    try {
      const response = await api.post('/ai/generate-email', null, {
        params: { recipient_name: aiForm.recipient, context: aiForm.context }
      });
      setEmailDraft(response.data.email_draft);
      toast.success('Email draft generated!');
    } catch (error) {
      toast.error('Failed to generate email draft');
    }
  };

  if (loading) return <div>Loading...</div>;

  const integrations = [
    {
      name: 'Email',
      icon: Mail,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      status: status?.sendgrid?.enabled,
      description: 'Send professional emails',
      action: 'email'
    },
    {
      name: 'SMS',
      icon: Phone,
      color: 'text-green-600',
      bg: 'bg-green-50',
      status: status?.twilio?.enabled,
      description: 'Send text messages',
      action: 'sms'
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'text-green-600',
      bg: 'bg-green-50',
      status: status?.twilio?.enabled,
      description: 'Connect via WhatsApp',
      action: 'whatsapp'
    },
    {
      name: 'AI Assistant',
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      status: status?.openai?.enabled,
      description: 'AI-powered features',
      action: 'ai'
    },
    {
      name: 'Stripe',
      icon: Zap,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      status: status?.stripe?.enabled,
      description: 'Payment processing',
      action: null
    },
    {
      name: 'Razorpay',
      icon: Zap,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      status: status?.razorpay?.enabled,
      description: 'Indian payments',
      action: null
    }
  ];

  return (
    <div className="space-y-6" data-testid="integrations-page">
      <div>
        <h1 className="text-4xl font-heading font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect your favorite tools and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.name} className="p-5 border border-gray-200 hover:border-orange-500/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`${integration.bg} p-3 rounded-lg`}>
                  <integration.icon className={`w-5 h-5 ${integration.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                </div>
              </div>
              <div>
                {integration.status ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            {integration.action && (
              <Dialog open={openDialog === integration.action} onOpenChange={(open) => setOpenDialog(open ? integration.action : '')}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    data-testid={`use-${integration.action}`}
                  >
                    {integration.status ? 'Use Now' : 'Test Mode'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{integration.name}</DialogTitle>
                  </DialogHeader>
                  
                  {integration.action === 'email' && (
                    <div className="space-y-4">
                      <div>
                        <Label>To</Label>
                        <Input
                          value={emailForm.to}
                          onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                          placeholder="recipient@example.com"
                        />
                      </div>
                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={emailForm.subject}
                          onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                          placeholder="Email subject"
                        />
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          value={emailForm.content}
                          onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <Button onClick={sendEmail} className="w-full bg-orange-500 hover:bg-orange-600">
                        Send Email
                      </Button>
                    </div>
                  )}
                  
                  {integration.action === 'sms' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={smsForm.to}
                          onChange={(e) => setSmsForm({ ...smsForm, to: e.target.value })}
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          value={smsForm.message}
                          onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <Button onClick={sendSMS} className="w-full bg-orange-500 hover:bg-orange-600">
                        Send SMS
                      </Button>
                    </div>
                  )}
                  
                  {integration.action === 'whatsapp' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={whatsappForm.to}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, to: e.target.value })}
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          value={whatsappForm.message}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, message: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <Button onClick={sendWhatsApp} className="w-full bg-orange-500 hover:bg-orange-600">
                        Send WhatsApp
                      </Button>
                    </div>
                  )}
                  
                  {integration.action === 'ai' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Recipient Name</Label>
                        <Input
                          value={aiForm.recipient}
                          onChange={(e) => setAiForm({ ...aiForm, recipient: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label>Context</Label>
                        <Textarea
                          value={aiForm.context}
                          onChange={(e) => setAiForm({ ...aiForm, context: e.target.value })}
                          placeholder="Following up on our meeting about..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={generateEmailDraft} className="w-full bg-orange-500 hover:bg-orange-600">
                        Generate Email Draft
                      </Button>
                      {emailDraft && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <Label>Generated Draft:</Label>
                          <p className="text-sm mt-2 whitespace-pre-wrap">{emailDraft}</p>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6 border border-gray-200 bg-orange-50">
        <div className="flex items-start gap-4">
          <Sparkles className="w-12 h-12 text-orange-500" />
          <div>
            <h3 className="text-xl font-heading font-semibold">AI-Powered CRM</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This CRM includes AI features powered by OpenAI GPT-4o mini: email drafting, sentiment analysis, lead scoring, and smart summaries.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Test mode is enabled for all integrations. Add your API keys in the backend .env file for production use.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}