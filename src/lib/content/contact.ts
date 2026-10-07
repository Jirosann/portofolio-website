 
import fs from 'fs';
import path from 'path';
import { ContactSchema, type Contact } from '@/lib/validation/schemas';

export function getContacts(): Contact[] {
  const contactsPath = path.join(process.cwd(), 'content/contact/contacts.json');
  
  if (!fs.existsSync(contactsPath)) {
    return [];
  }
  
  const raw = fs.readFileSync(contactsPath, 'utf-8');
  const data = JSON.parse(raw);
  
  if (!Array.isArray(data)) {
    throw new Error('Contacts must be an array');
  }
  
  const contacts = data
    .map((contact: any) => {
      const result = ContactSchema.safeParse(contact);
      if (!result.success) {
        throw new Error(`Contact validation failed: ${result.error.message}`);
      }
      return result.data;
    })
    .filter(contact => contact.visible); // Only visible contacts
  
  // Sort by order
  return contacts.sort((a, b) => a.order - b.order);
}

/**
 * Returns the URL for a contact entry.
 * Uses the explicit `url` field if present, otherwise constructs from type+value.
 */
export function getContactUrl(contact: Contact): string {
  // If explicit URL is provided, use it
  if (contact.url) {
    return contact.url;
  }

  // Fallback: construct URL from type
  switch (contact.type) {
    case 'email':
      return `mailto:${contact.value}`;
    case 'linkedin':
      return `https://linkedin.com/in/${contact.value}`;
    case 'github':
      return `https://github.com/${contact.value}`;
    case 'instagram':
      return `https://instagram.com/${contact.value}`;
    case 'whatsapp':
      return `https://wa.me/${contact.value}`;
    default:
      return '#';
  }
}
