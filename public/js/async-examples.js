/*
  ═══════════════════════════════════════════════════════
  async-examples.js  —  Демонстрація різних асинхронних патернів

  Цей файл показує приклади всіх чотирьох методів роботи з асинхронними
  операціями, як вимагає лабораторна робота №3.

  У реальному додатку використовується тільки async/await, але тут
  задокументовано всі варіанти для демонстрації.
  ═══════════════════════════════════════════════════════
*/

'use strict';

// Тестові дані для демонстрації
const mockProfiles = [
  { id: 1, name: 'Atlas', age: 18 },
  { id: 2, name: 'Jordan', age: 26 },
  { id: 3, name: 'Sam', age: 23 }
];

/*
  ─────────────────────────────────────────────────────
  1. СИНХРОННИЙ ЗАПИТ
  Не рекомендується для мережевих операцій, але показаний для порівняння.
  ─────────────────────────────────────────────────────
*/
function getProfilesSync() {
  console.log('[SYNC] Починаємо синхронний запит...');
  // Імітація синхронної операції (в реальності це заблокує UI)
  const start = Date.now();
  while (Date.now() - start < 1000) {} // Блокуюча затримка 1с
  console.log('[SYNC] Синхронний запит завершено');
  return mockProfiles;
}

/*
  ─────────────────────────────────────────────────────
  2. CALLBACK ФУНКЦІЯ
  Класичний підхід до асинхронності в JavaScript.
  ─────────────────────────────────────────────────────
*/
function getProfilesWithCallback(callback) {
  console.log('[CALLBACK] Починаємо запит з callback...');

  // Імітація асинхронної операції (наприклад, fetch)
  setTimeout(() => {
    console.log('[CALLBACK] Отримали дані');
    callback(null, mockProfiles); // (error, data)
  }, 1000);
}

/*
  ─────────────────────────────────────────────────────
  3. PROMISE з .then/.catch
  Сучасний підхід до асинхронності.
  ─────────────────────────────────────────────────────
*/
function getProfilesPromise() {
  console.log('[PROMISE] Починаємо Promise запит...');

  return new Promise((resolve, reject) => {
    // Імітація асинхронної операції
    setTimeout(() => {
      console.log('[PROMISE] Promise виконано');
      resolve(mockProfiles);
      // reject(new Error('Щось пішло не так')); // для помилки
    }, 1000);
  });
}

/*
  ─────────────────────────────────────────────────────
  4. ASYNC/AWAIT
  Найчистіший синтаксис для роботи з Promise.
  ─────────────────────────────────────────────────────
*/
async function getProfilesAsync() {
  console.log('[ASYNC] Починаємо async запит...');

  try {
    // Імітація await (в реальності це буде fetch)
    const result = await new Promise((resolve) => {
      setTimeout(() => {
        console.log('[ASYNC] Async запит виконано');
        resolve(mockProfiles);
      }, 1000);
    });

    return result;
  } catch (error) {
    console.error('[ASYNC] Помилка:', error);
    throw error;
  }
}

/*
  ─────────────────────────────────────────────────────
  ДЕМОНСТРАЦІЯ ВИКОРИСТАННЯ
  ─────────────────────────────────────────────────────
*/
function demonstrateAsyncPatterns() {
  console.log('🚀 Демонстрація асинхронних патернів\n');

  // 1. Синхронний (блокує UI)
  console.log('1. Синхронний запит:');
  const syncResult = getProfilesSync();
  console.log('Результат:', syncResult);
  console.log('');

  // 2. Callback
  console.log('2. Callback функція:');
  getProfilesWithCallback((error, data) => {
    if (error) {
      console.error('Помилка:', error);
    } else {
      console.log('Результат:', data);
    }
    console.log('');
  });

  // 3. Promise
  console.log('3. Promise з .then/.catch:');
  getProfilesPromise()
    .then(data => {
      console.log('Результат:', data);
      console.log('');
    })
    .catch(error => {
      console.error('Помилка:', error);
    });

  // 4. Async/await
  console.log('4. Async/await:');
  getProfilesAsync()
    .then(data => {
      console.log('Результат:', data);
      console.log('✅ Усі патерни продемонстровано!');
    })
    .catch(error => {
      console.error('Помилка:', error);
    });
}

// Експорт для використання в інших файлах
window.AsyncExamples = {
  getProfilesSync,
  getProfilesWithCallback,
  getProfilesPromise,
  getProfilesAsync,
  demonstrateAsyncPatterns
};