import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchBackend } from '../hooks/useNui';

// ============================================
// Ícones inline (sem dependência externa)
// ============================================

const Icons = {
  back: (
    <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
      <path d="M9 1L1.5 8.5L9 16" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 4V16M4 10H16" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#8E8E93" strokeWidth="1.5"/>
      <path d="M11 11L14.5 14.5" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#30D158">
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
    </svg>
  ),
  message: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#007AFF">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
  ),
  block: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF3B30">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z"/>
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF3B30">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  ),
  edit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#007AFF">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  person: (
    <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#636366"/>
      <circle cx="40" cy="30" r="12" fill="#AEAEB2"/>
      <ellipse cx="40" cy="58" rx="20" ry="14" fill="#AEAEB2"/>
    </svg>
  ),
  emergency: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF3B30">
      <path d="M12 2L2 22h20L12 2zm0 4l7.53 14H4.47L12 6zm-1 6v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
    </svg>
  ),
};

// ============================================
// Serviços de emergência
// ============================================

const EMERGENCY_SERVICES = [
  { number: '190', name: 'Polícia Militar', color: '#007AFF' },
  { number: '192', name: 'SAMU', color: '#FF9F0A' },
  { number: '193', name: 'Bombeiros', color: '#FF3B30' },
  { number: '911', name: 'Emergência Geral', color: '#30D158' },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Contacts({ onNavigate }) {
  const [view, setView] = useState('list'); // list | detail | add | edit | blocked
  const [contacts, setContacts] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState('');

  // ============================================
  // Carregar contatos
  // ============================================

  const loadContacts = useCallback(async () => {
    setLoading(true);
    const res = await fetchBackend('contacts_list');
    if (res?.contacts) setContacts(res.contacts);
    const blockedRes = await fetchBackend('contacts_blocked_list');
    if (blockedRes?.blocked) setBlocked(blockedRes.blocked);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // ============================================
  // Contatos filtrados e agrupados por letra
  // ============================================

  const filteredContacts = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c =>
      c.contact_name.toLowerCase().includes(q) ||
      c.contact_phone.includes(q)
    );
  }, [contacts, search]);

  const groupedContacts = useMemo(() => {
    const groups = {};
    filteredContacts.forEach(c => {
      const letter = c.contact_name[0]?.toUpperCase() || '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredContacts]);

  const alphabet = useMemo(() => {
    return groupedContacts.map(([letter]) => letter);
  }, [groupedContacts]);

  // ============================================
  // Actions
  // ============================================

  const handleAdd = async () => {
    setFormError('');
    if (!formName.trim()) return setFormError('Digite um nome');
    if (!formPhone.trim()) return setFormError('Digite um número');

    const res = await fetchBackend('contacts_add', {
      name: formName.trim(),
      phone: formPhone.trim(),
    });

    if (res?.error) return setFormError(res.error);

    if (res?.contact) {
      setContacts(prev => [...prev, res.contact].sort((a, b) =>
        a.contact_name.localeCompare(b.contact_name)
      ));
    }
    setView('list');
    setFormName('');
    setFormPhone('');
  };

  const handleUpdate = async () => {
    setFormError('');
    if (!formName.trim()) return setFormError('Digite um nome');

    await fetchBackend('contacts_update', {
      id: selectedContact.id,
      name: formName.trim(),
      phone: formPhone.trim() || selectedContact.contact_phone,
    });

    setContacts(prev => prev.map(c =>
      c.id === selectedContact.id
        ? { ...c, contact_name: formName.trim(), contact_phone: formPhone.trim() || c.contact_phone }
        : c
    ));
    setSelectedContact({ ...selectedContact, contact_name: formName.trim() });
    setView('detail');
  };

  const handleDelete = async (id) => {
    await fetchBackend('contacts_delete', { id });
    setContacts(prev => prev.filter(c => c.id !== id));
    setView('list');
  };

  const handleBlock = async (phone) => {
    await fetchBackend('contacts_block', { phone });
    setBlocked(prev => [...prev, phone]);
  };

  const handleUnblock = async (phone) => {
    await fetchBackend('contacts_unblock', { phone });
    setBlocked(prev => prev.filter(p => p !== phone));
  };

  const scrollToLetter = (letter) => {
    const el = document.getElementById(`contact-section-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // ============================================
  // VIEWS
  // ============================================

  // --- HEADER COMPONENT ---
  const Header = ({ title, left, right }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 8px', background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ width: 60, display: 'flex', alignItems: 'center' }}>{left}</div>
      <span style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>{title}</span>
      <div style={{ width: 60, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );

  // --- LIST VIEW ---
  if (view === 'list') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <Header
          title="Contatos"
          left={
            <button onClick={() => setView('blocked')} style={btnStyle}>
              <span style={{ fontSize: 12, color: '#FF3B30' }}>Bloqueados</span>
            </button>
          }
          right={
            <button onClick={() => {
              setFormName('');
              setFormPhone('');
              setFormError('');
              setView('add');
            }} style={btnStyle}>
              {Icons.plus}
            </button>
          }
        />

        {/* Search bar */}
        <div style={{ padding: '0 16px 8px', background: 'rgba(0,0,0,0.85)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#1C1C1E', borderRadius: 10, padding: '8px 12px',
          }}>
            {Icons.search}
            <input
              type="text"
              placeholder="Buscar"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 16, width: '100%', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Emergency services */}
        <div style={{ padding: '4px 16px 8px' }}>
          <span style={{ fontSize: 13, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase' }}>
            Emergência
          </span>
          {EMERGENCY_SERVICES.map(svc => (
            <div key={svc.number} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '0.5px solid #2C2C2E',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 18, background: svc.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#fff',
                }}>
                  {svc.number.slice(-2)}
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 16 }}>{svc.name}</div>
                  <div style={{ color: '#8E8E93', fontSize: 13 }}>{svc.number}</div>
                </div>
              </div>
              <button
                onClick={() => onNavigate?.('phone', { dial: svc.number })}
                style={btnStyle}
              >
                {Icons.phone}
              </button>
            </div>
          ))}
        </div>

        {/* Contact list with A-Z sections */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px', position: 'relative' }}>
          {loading ? (
            <div style={{ color: '#8E8E93', textAlign: 'center', paddingTop: 40, fontSize: 15 }}>
              Carregando...
            </div>
          ) : groupedContacts.length === 0 ? (
            <div style={{ color: '#8E8E93', textAlign: 'center', paddingTop: 40, fontSize: 15 }}>
              {search ? 'Nenhum resultado' : 'Nenhum contato'}
            </div>
          ) : (
            groupedContacts.map(([letter, letterContacts]) => (
              <div key={letter} id={`contact-section-${letter}`}>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: '#fff',
                  padding: '16px 0 4px', position: 'sticky', top: 0,
                  background: '#000',
                }}>
                  {letter}
                </div>
                {letterContacts.map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setSelectedContact(contact);
                      setView('detail');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0', borderBottom: '0.5px solid #2C2C2E',
                      cursor: 'pointer',
                    }}
                  >
                    {Icons.person}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: 16 }}>{contact.contact_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div style={{ height: 80 }} />
        </div>

        {/* A-Z sidebar */}
        {alphabet.length > 3 && (
          <div style={{
            position: 'absolute', right: 2, top: 140, bottom: 80,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            zIndex: 5,
          }}>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                style={{
                  background: 'none', border: 'none', color: '#007AFF',
                  fontSize: 11, fontWeight: 600, padding: '1px 6px', cursor: 'pointer',
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (view === 'detail' && selectedContact) {
    const isBlocked = blocked.includes(selectedContact.contact_phone);

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <Header
          title=""
          left={
            <button onClick={() => setView('list')} style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
              {Icons.back}
              <span style={{ color: '#007AFF', fontSize: 17 }}>Contatos</span>
            </button>
          }
          right={
            <button onClick={() => {
              setFormName(selectedContact.contact_name);
              setFormPhone(selectedContact.contact_phone);
              setFormError('');
              setView('edit');
            }} style={btnStyle}>
              <span style={{ color: '#007AFF', fontSize: 17 }}>Editar</span>
            </button>
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
          {/* Avatar grande */}
          <div style={{
            width: 80, height: 80, borderRadius: 40, background: '#636366',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <span style={{ fontSize: 32, color: '#AEAEB2', fontWeight: 300 }}>
              {selectedContact.contact_name[0]?.toUpperCase()}
            </span>
          </div>

          <div style={{ color: '#fff', fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
            {selectedContact.contact_name}
          </div>
          <div style={{ color: '#8E8E93', fontSize: 15, marginBottom: 20 }}>
            {selectedContact.contact_phone}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <ActionButton
              icon={Icons.phone}
              label="Ligar"
              onClick={() => onNavigate?.('phone', { dial: selectedContact.contact_phone })}
            />
            <ActionButton
              icon={Icons.message}
              label="SMS"
              onClick={() => onNavigate?.('sms', { to: selectedContact.contact_phone })}
            />
            <ActionButton
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>}
              label="WhatsApp"
              color="#25D366"
              onClick={() => onNavigate?.('whatsapp', { to: selectedContact.contact_phone })}
            />
          </div>
        </div>

        {/* Info section */}
        <div style={{ padding: '0 16px' }}>
          <div style={{
            background: '#1C1C1E', borderRadius: 12, padding: '12px 16px', marginBottom: 12,
          }}>
            <div style={{ color: '#8E8E93', fontSize: 13, marginBottom: 4 }}>celular</div>
            <div style={{ color: '#007AFF', fontSize: 16 }}>{selectedContact.contact_phone}</div>
          </div>

          {/* Block / Unblock */}
          <button
            onClick={() => isBlocked
              ? handleUnblock(selectedContact.contact_phone)
              : handleBlock(selectedContact.contact_phone)
            }
            style={{
              width: '100%', background: '#1C1C1E', borderRadius: 12,
              padding: '14px 16px', border: 'none', cursor: 'pointer',
              color: isBlocked ? '#30D158' : '#FF3B30', fontSize: 16,
              textAlign: 'left', marginBottom: 12,
            }}
          >
            {isBlocked ? 'Desbloquear Contato' : 'Bloquear Contato'}
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDelete(selectedContact.id)}
            style={{
              width: '100%', background: '#1C1C1E', borderRadius: 12,
              padding: '14px 16px', border: 'none', cursor: 'pointer',
              color: '#FF3B30', fontSize: 16, textAlign: 'left',
            }}
          >
            Apagar Contato
          </button>
        </div>
      </div>
    );
  }

  // --- ADD / EDIT VIEW ---
  if (view === 'add' || view === 'edit') {
    const isEdit = view === 'edit';

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <Header
          title={isEdit ? 'Editar Contato' : 'Novo Contato'}
          left={
            <button onClick={() => setView(isEdit ? 'detail' : 'list')} style={btnStyle}>
              <span style={{ color: '#007AFF', fontSize: 17 }}>Cancelar</span>
            </button>
          }
          right={
            <button onClick={isEdit ? handleUpdate : handleAdd} style={btnStyle}>
              <span style={{ color: '#007AFF', fontSize: 17, fontWeight: 600 }}>
                {isEdit ? 'OK' : 'Salvar'}
              </span>
            </button>
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 40, background: '#636366',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <span style={{ fontSize: 32, color: '#AEAEB2', fontWeight: 300 }}>
              {formName[0]?.toUpperCase() || '?'}
            </span>
          </div>

          {/* Form fields */}
          <div style={{ width: '100%' }}>
            <div style={{
              background: '#1C1C1E', borderRadius: 12, overflow: 'hidden', marginBottom: 16,
            }}>
              <input
                type="text"
                placeholder="Nome"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                autoFocus
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  borderBottom: '0.5px solid #2C2C2E', outline: 'none',
                  color: '#fff', fontSize: 16, padding: '14px 16px', fontFamily: 'inherit',
                }}
              />
              <input
                type="text"
                placeholder="Número (ex: 001-001)"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                readOnly={isEdit}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  outline: 'none', fontFamily: 'inherit',
                  color: isEdit ? '#8E8E93' : '#fff', fontSize: 16, padding: '14px 16px',
                }}
              />
            </div>

            {formError && (
              <div style={{
                color: '#FF3B30', fontSize: 14, textAlign: 'center',
                padding: '8px 0',
              }}>
                {formError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- BLOCKED VIEW ---
  if (view === 'blocked') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <Header
          title="Bloqueados"
          left={
            <button onClick={() => setView('list')} style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
              {Icons.back}
              <span style={{ color: '#007AFF', fontSize: 17 }}>Voltar</span>
            </button>
          }
        />

        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
          {blocked.length === 0 ? (
            <div style={{ color: '#8E8E93', textAlign: 'center', paddingTop: 40, fontSize: 15 }}>
              Nenhum número bloqueado
            </div>
          ) : (
            blocked.map(phone => {
              const contact = contacts.find(c => c.contact_phone === phone);
              return (
                <div key={phone} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '0.5px solid #2C2C2E',
                }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: 16 }}>
                      {contact?.contact_name || phone}
                    </div>
                    <div style={{ color: '#8E8E93', fontSize: 13 }}>{phone}</div>
                  </div>
                  <button
                    onClick={() => handleUnblock(phone)}
                    style={{
                      background: '#1C1C1E', border: 'none', borderRadius: 8,
                      color: '#30D158', fontSize: 14, padding: '6px 12px', cursor: 'pointer',
                    }}
                  >
                    Desbloquear
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        background: '#1C1C1E', borderRadius: 12, padding: '10px 20px',
        border: 'none', cursor: 'pointer', minWidth: 72,
      }}
    >
      {icon}
      <span style={{ color: '#8E8E93', fontSize: 12 }}>{label}</span>
    </button>
  );
}

// ============================================
// STYLES
// ============================================

const btnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
};
