/*
  ═══════════════════════════════════════════════════════
  api.js  —  All communication with the backend

  HOW TO USE:
    Every function calls the backend and returns parsed JSON.
    If the backend isn't ready yet, the function returns
    hardcoded stub data so the frontend still works.

  TO CONNECT A REAL BACKEND:
    1. Set BASE_URL to your server address (line 23).
    2. In each function, uncomment the real fetch() call
       and delete the "return STUB_DATA" line above it.

  NAMING CONVENTION:
    Functions are named after what they fetch/send:
      get___()     →  read data
      create___()  →  POST new data
      update___()  →  PUT/PATCH existing data
  ═══════════════════════════════════════════════════════
*/

'use strict';

/*
  ─────────────────────────────────────────────────
  CONFIG
  Only this URL needs to change when the backend
  is deployed or its address changes.
  ─────────────────────────────────────────────────
*/
const BASE_URL = 'http://localhost:3000';   // ← change this for production


/*
  ─────────────────────────────────────────────────
  HELPER
  Shared fetch wrapper. Throws on non-2xx response.
  All API functions use this so error handling is
  consistent across the whole app.
  ─────────────────────────────────────────────────
*/
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(BASE_URL + path, options);

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }

  // 204 No Content → return null
  if (res.status === 204) return null;

  return res.json();
}


/*
  ═══════════════════════════════════════════════════════
  AUTH
  ═══════════════════════════════════════════════════════
*/

/*
  Register a new account.
  DTO in:  CreateUserDTO  { email, password }
  Returns: { id, email }  (or session token — adapt to your backend)
*/
async function createUser({ email, password }) {
  // --- STUB (delete when backend is ready) ---
  console.log('[API] createUser', { email, password });
  return { id: 1, email };
  // --- REAL (uncomment when backend is ready) ---
  // return request('POST', '/auth/register', { email, password });
}

/*
  Log in.
  Body:    { email, password }
  Returns: { token } or session cookie — adapt to your backend
*/
async function login({ email, password }) {
  // --- STUB ---
  console.log('[API] login', { email, password });
  return { token: 'stub-token', userId: 1 };
  // --- REAL ---
  // return request('POST', '/auth/login', { email, password });
}

/*
  Log out.
*/
async function logout() {
  // --- STUB ---
  console.log('[API] logout');
  return null;
  // --- REAL ---
  // return request('POST', '/auth/logout');
}


/*
  ═══════════════════════════════════════════════════════
  PROFILES
  ═══════════════════════════════════════════════════════
*/

/*
  Get all profiles for the browse page.
  Returns: ViewProfileDTO[]
  ViewProfileDTO { id, name, age, gender, publicInfo, keywords[] }
*/
async function getProfiles() {
  // --- STUB ---
  return [
    {
      id: 2,
      name: 'Jordan',
      age: 26,
      gender: 'non-binary',
      publicInfo: { city: 'Kyiv', goal: 'friendship', bio: '', photo: '' },
      keywords: ['jazz', 'cycling', 'cats'],
    },
    {
      id: 3,
      name: 'Sam',
      age: 23,
      gender: 'man',
      publicInfo: { city: 'Lviv', goal: 'relationship', bio: '', photo: '' },
      keywords: ['hiking', 'coffee', 'books'],
    },
    {
      id: 4,
      name: 'Alex',
      age: 29,
      gender: 'woman',
      publicInfo: { city: 'Kharkiv', goal: 'friendship', bio: '', photo: '' },
      keywords: ['art', 'travel', 'dogs'],
    },
  ];
  // --- REAL ---
  // return request('GET', '/profiles');
}

/*
  Get one profile with full details (bio, private info if matched).
  Returns: ViewFullProfileDTO
  ViewFullProfileDTO extends ViewProfileDTO + { phone, email, social }
*/
async function getProfileById(id) {
  // --- STUB ---
  return {
    id,
    name: 'Jordan',
    age: 26,
    gender: 'non-binary',
    publicInfo: {
      city:   'Kyiv',
      goal:   'friendship',
      bio:    'I love jazz, long bike rides, and strong coffee.',
      photo:  '',
      social: { instagram: 'instagram.com/jordan' },
    },
    keywords: ['jazz', 'cycling', 'cats'],
    // privateInfo is only present when mutually matched:
    // phone: '+380 …',
    // email: 'jordan@example.com',
  };
  // --- REAL ---
  // return request('GET', `/profiles/${id}`);
}

/*
  Get the current user's own profile (pre-fill edit form).
  Returns: ViewFullProfileDTO
*/
async function getMyProfile() {
  // --- STUB ---
  return {
    id: 1,
    name: 'Evgenyy',
    age: 18,
    gender: 'man',
    publicInfo: { city: 'Kyiv', goal: '', bio: '', photo: '', social: {} },
    keywords: [],
    phone: '',
    email: '',
  };
  // --- REAL ---
  // return request('GET', '/profiles/me');
}

/*
  Save changes to the current user's profile.
  DTO in: UpdateProfileDTO {
    name?, age?, gender?,
    publicInfo?:  { city, goal, bio, photo },
    privateInfo?: { phone, email, social },
    keywords?:    string[]
  }

  Keywords are sent as an array.
  The form stores them as a comma-separated string —
  splitting happens here so app.js stays clean.
*/
async function updateMyProfile(formData) {
  // Split comma-separated keyword string into array
  const keywordsRaw = formData.keywords || '';
  const keywords = keywordsRaw
    .split(',')
    .map(k => k.trim())
    .filter(k => k !== '');

  const body = {
    name:   formData.name   || undefined,
    age:    formData.age    ? Number(formData.age) : undefined,
    gender: formData.gender || undefined,
    publicInfo: {
      city:  formData.city  || undefined,
      goal:  formData.goal  || undefined,
      bio:   formData.bio   || undefined,
      photo: formData.photo || undefined,
    },
    privateInfo: {
      phone:  formData.phone  || undefined,
      email:  formData.email  || undefined,
      social: formData.social || undefined,
    },
    keywords,
  };

  // --- STUB ---
  console.log('[API] updateMyProfile', body);
  return body;
  // --- REAL ---
  // return request('PUT', '/profiles/me', body);
}


/*
  ═══════════════════════════════════════════════════════
  INVITATIONS
  ═══════════════════════════════════════════════════════
*/

/*
  Get invitations sent TO the current user.
  Returns: ViewInvitationDTO[]
  ViewInvitationDTO { id, senderName, status }
*/
async function getReceivedInvitations() {
  // --- STUB ---
  return [
    { id: 10, senderName: 'Sam',  status: 'pending'  },
    { id: 11, senderName: 'Alex', status: 'accepted' },
  ];
  // --- REAL ---
  // return request('GET', '/invitations/received');
}

/*
  Get invitations sent BY the current user.
  Returns: ViewInvitationDTO[]
*/
async function getSentInvitations() {
  // --- STUB ---
  return [
    { id: 20, senderName: 'Jordan', status: 'pending' },
  ];
  // --- REAL ---
  // return request('GET', '/invitations/sent');
}

/*
  Send a new invitation to another user.
  DTO in: CreateInvitationDTO { fromId, toId }
  status is always 'pending' — set by the DTO constructor on the backend.
*/
async function createInvitation({ fromId, toId }) {
  // --- STUB ---
  console.log('[API] createInvitation', { fromId, toId });
  return { id: 99, fromId, toId, status: 'pending' };
  // --- REAL ---
  // return request('POST', '/invitations', { fromId, toId });
}

/*
  Accept or decline a received invitation.
  status: 'accepted' | 'declined'
*/
async function updateInvitationStatus(invitationId, status) {
  // --- STUB ---
  console.log('[API] updateInvitationStatus', invitationId, status);
  return { id: invitationId, status };
  // --- REAL ---
  // return request('PATCH', `/invitations/${invitationId}`, { status });
}


/*
  ─────────────────────────────────────────────────
  EXPORT
  All functions are attached to window.API so
  app.js can call them as API.getProfiles() etc.
  ─────────────────────────────────────────────────
*/
window.API = {
  // Auth
  createUser,
  login,
  logout,
  // Profiles
  getProfiles,
  getProfileById,
  getMyProfile,
  updateMyProfile,
  // Invitations
  getReceivedInvitations,
  getSentInvitations,
  createInvitation,
  updateInvitationStatus,
};
