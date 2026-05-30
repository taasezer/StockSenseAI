import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatHubConnection } from '../services/api'

interface Contact {
  id: number
  name: string
  supplierCode: string
  unreadCount: number
}

interface Message {
  id: number
  senderSupplierId: number
  senderSupplierName: string
  receiverSupplierId: number
  receiverSupplierName: string
  senderUserId: number
  senderUserName: string
  content: string
  createdAt: string
  isRead: boolean
}

const Messages = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [mySupplierId, setMySupplierId] = useState<number>(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const init = async () => {
      try {
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setMySupplierId(profileData.supplierId)
        }
        await fetchContacts()
      } catch (e) {
        console.error(e)
      }
    }

    init()

    // Start SignalR
    if (chatHubConnection.state === 'Disconnected') {
      chatHubConnection.start().catch(console.error)
    }

    const handleReceiveMessage = (message: Message) => {
      setMessages(prev => {
        // If the message belongs to the current active chat, add it
        // Note: we can't directly read `activeContact` inside this closure easily without tracking refs, 
        // but we can check if it matches in a functional update
        return [...prev, message] // We'll filter below or we just append
      })
      
      // Update unread count if it's not the active contact
      setContacts(prev => prev.map(c => {
        if (c.id === message.senderSupplierId) {
          // If this isn't the active contact (we'll check via ref or just let it increment and the user will clear it when they click)
          return { ...c, unreadCount: c.unreadCount + 1 }
        }
        return c
      }))
    }

    chatHubConnection.on("ReceiveMessage", handleReceiveMessage)

    return () => {
      chatHubConnection.off("ReceiveMessage", handleReceiveMessage)
    }
  }, [navigate])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // When active contact changes, fetch messages
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id)
      markAsRead(activeContact.id)
    }
  }, [activeContact])

  const fetchContacts = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/contacts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.ok) {
      setContacts(await res.json())
    }
  }

  const fetchMessages = async (contactId: number) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${contactId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (res.ok) {
      setMessages(await res.json())
    }
  }

  const markAsRead = async (contactId: number) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${contactId}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unreadCount: 0 } : c))
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeContact) return

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverSupplierId: activeContact.id,
          content: newMessage
        })
      })
      
      if (res.ok) {
        setNewMessage('')
        // The message will come back via SignalR
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', gap: '20px' }}>
      
      {/* Contacts Sidebar */}
      <div className="stat-card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Messages</h2>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {contacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                backgroundColor: activeContact?.id === contact.id ? 'var(--bg-dark)' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{contact.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{contact.supplierCode}</div>
              </div>
              {contact.unreadCount > 0 && (
                <div style={{
                  backgroundColor: 'var(--brand-red)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {contact.unreadCount}
                </div>
              )}
            </div>
          ))}
          {contacts.length === 0 && (
            <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>
              No contacts available.
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="stat-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        {activeContact ? (
          <>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>{activeContact.name}</h3>
              <div style={{ fontSize: '13px', color: 'var(--brand-red)' }}>{activeContact.supplierCode}</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.filter(m => m.senderSupplierId === activeContact.id || m.receiverSupplierId === activeContact.id).map(msg => {
                const isMine = msg.senderSupplierId === mySupplierId
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      backgroundColor: isMine ? '#2563eb' : 'var(--bg-dark)',
                      color: '#fff',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      borderBottomRightRadius: isMine ? '0' : '12px',
                      borderBottomLeftRadius: !isMine ? '0' : '12px',
                      border: isMine ? 'none' : '1px solid var(--border-color)'
                    }}>
                      {!isMine && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{msg.senderUserName}</div>}
                      <div style={{ lineHeight: '1.4' }}>{msg.content}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textAlign: 'right', marginTop: '4px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ margin: 0, flex: 1 }}
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 24px' }}>
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a contact to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
