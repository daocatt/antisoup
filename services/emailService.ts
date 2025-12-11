
import { SystemConfig } from '../types';

interface SendLoginLinkResult {
    success: boolean;
    message: string;
    mockLink?: string; // For demo/dev purposes
}

/**
 * Service to handle Email sending logic for Magic Links.
 */
class EmailService {
    
    /**
     * Sends a magic login link to the user.
     */
    async sendLoginLink(email: string, config: SystemConfig): Promise<SendLoginLinkResult> {
        // 1. Generate a mock token and link (expires in 10 minutes)
        const token = btoa(JSON.stringify({ email, exp: Date.now() + 600000 }));
        const magicLink = `${window.location.origin}?token=${token}`; 
        
        console.log(`[EmailService] Generated Magic Link for ${email}: ${magicLink}`);

        // 2. Send via configured provider
        if (config.emailProvider === 'emailjs') {
            return this.sendViaEmailJS(email, magicLink);
        } else if (config.emailProvider === 'mailgun') {
            return this.sendViaMailgun(email, magicLink);
        } else {
            // Default/Dev mode
            return {
                success: true,
                message: '模拟发送成功 (未配置邮件服务)',
                mockLink: magicLink
            };
        }
    }

    private async sendViaEmailJS(email: string, link: string): Promise<SendLoginLinkResult> {
        const serviceId = process.env.EMAILJS_SERVICE_ID;
        const templateId = process.env.EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            return { success: false, message: 'EmailJS 环境变量配置不完整 (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY)' };
        }

        try {
            const data = {
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                template_params: {
                    to_email: email,
                    login_link: link,
                    site_name: '反鸡汤联盟'
                }
            };

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                return { success: true, message: '登录链接已通过 EmailJS 发送' };
            } else {
                return { success: false, message: 'EmailJS 发送失败: ' + await response.text() };
            }
        } catch (e) {
            return { success: false, message: 'EmailJS 网络错误' };
        }
    }

    private async sendViaMailgun(email: string, link: string): Promise<SendLoginLinkResult> {
        const apiKey = process.env.MAILGUN_API_KEY;
        const domain = process.env.MAILGUN_DOMAIN;

        if (!apiKey || !domain) {
            return { success: false, message: 'Mailgun 环境变量配置不完整 (MAILGUN_API_KEY, MAILGUN_DOMAIN)' };
        }

        // WARNING: Mailgun API requires Basic Auth with API Key. 
        // Calling this from Frontend exposes the API Key. 
        // In a real Next.js app, this MUST be done in an API Route (Server Side).
        
        console.warn('⚠️ Mailgun API called from client-side. In production, move this to a backend API route.');

        try {
            const form = new FormData();
            form.append('from', `Anti-Soup Login <noreply@${domain}>`);
            form.append('to', email);
            form.append('subject', '您的登录链接 - 反鸡汤联盟');
            form.append('text', `点击链接登录: ${link}`);

            const auth = btoa(`api:${apiKey}`);
            
            const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`
                },
                body: form
            });

            if (response.ok) {
                return { success: true, message: '登录链接已通过 Mailgun 发送' };
            } else {
                return { success: false, message: 'Mailgun 发送失败: ' + await response.text() };
            }
        } catch (e) {
            return { success: false, message: 'Mailgun 网络错误' };
        }
    }
}

export const emailService = new EmailService();
