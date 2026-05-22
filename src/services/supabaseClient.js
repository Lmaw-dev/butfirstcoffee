const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const sessionKey = 'bfc_supabase_session';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function getHeaders(extraHeaders = {}, authToken = null) {
  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${authToken || supabaseAnonKey}`,
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
}

async function request(path, { method = 'GET', body, headers = {}, prefer = 'return=representation', authToken = null } = {}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase environment variables are missing.');
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers: getHeaders({
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    }, authToken),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_error) {
      data = text;
    }
  }

  if (!response.ok) {
    const message = (data && (data.message || data.error_description || data.msg)) || response.statusText || 'Supabase request failed';
    throw new Error(message);
  }

  return data;
}

function getSessionFromStorage() {
  try {
    const raw = localStorage.getItem(sessionKey);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function setSessionToStorage(session) {
  try {
    if (session) {
      localStorage.setItem(sessionKey, JSON.stringify(session));
    } else {
      localStorage.removeItem(sessionKey);
    }
  } catch (_error) {
    // ignore storage issues
  }
}

const authListeners = new Set();

function emitAuthChange(session) {
  authListeners.forEach((listener) => listener('SIGNED_IN', session));
}

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }) {
      const data = await request('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: { email, password },
      });

      const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      };

      setSessionToStorage(session);
      emitAuthChange(session);

      return { data: session, error: null };
    },

    async getSession() {
      return { data: { session: getSessionFromStorage() }, error: null };
    },

    async signOut() {
      setSessionToStorage(null);
      emitAuthChange(null);
      return { error: null };
    },

    onAuthStateChange(callback) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },

  from(table) {
    const state = {
      method: 'GET',
      path: `/rest/v1/${table}`,
      query: new URLSearchParams(),
      body: undefined,
      single: false,
      prefer: 'return=representation',
    };

    const builder = {
      select(columns = '*') {
        state.query.set('select', columns);
        return builder;
      },
      order(column, { ascending = true } = {}) {
        state.query.append('order', `${column}.${ascending ? 'asc' : 'desc'}`);
        return builder;
      },
      limit(count) {
        state.query.set('limit', String(count));
        return builder;
      },
      eq(column, value) {
        state.query.append(column, `eq.${value}`);
        return builder;
      },
      gte(column, value) {
        state.query.append(column, `gte.${value}`);
        return builder;
      },
      insert(payload) {
        state.method = 'POST';
        state.body = payload;
        return builder;
      },
      update(payload) {
        state.method = 'PATCH';
        state.body = payload;
        return builder;
      },
      delete() {
        state.method = 'DELETE';
        return builder;
      },
      single() {
        state.single = true;
        return builder.execute();
      },
      async execute() {
        const path = `${state.path}${state.query.toString() ? `?${state.query.toString()}` : ''}`;
        const session = getSessionFromStorage();
        const data = await request(path, {
          method: state.method,
          body: state.body,
          prefer: state.prefer,
          authToken: session?.access_token || supabaseAnonKey,
        });

        if (state.single) {
          return { data: Array.isArray(data) ? data[0] : data, error: null };
        }

        return { data, error: null };
      },
    };

    return builder;
  },
};
