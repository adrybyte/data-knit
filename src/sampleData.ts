/**
 * Deterministic in-memory datasets used by the "Try Live Demo" experience.
 * They are plain CSV content; the app turns them into File objects so the
 * existing local parser and merge pipeline can be reused without a network
 * request.
 */

const FIRST_NAMES = [
  'Alex',
  'Jordan',
  'Taylor',
  'Casey',
  'Morgan',
  'Riley',
  'Avery',
  'Cameron',
  'Drew',
  'Quinn',
]

const LAST_NAMES = [
  'Morgan',
  'Lee',
  'Patel',
  'Garcia',
  'Kim',
  'Nguyen',
  'Brown',
  'Davis',
  'Martinez',
  'Wilson',
]

const CITIES = [
  'Madrid',
  'Barcelona',
  'London',
  'Berlin',
  'Paris',
  'Amsterdam',
  'Lisbon',
  'Dublin',
  'Milan',
  'Vienna',
]

const PRODUCTS = [
  'Starter Plan',
  'Pro Plan',
  'Team Plan',
  'Analytics Add-on',
  'Priority Support',
]

const STATUSES = ['Paid', 'Pending', 'Refunded']

const USER_HEADERS = [
  'user_id',
  'name',
  'email',
  'city',
  'order_id',
  'product',
  'amount',
  'status',
]

const ORDER_HEADERS = ['user_id', 'order_id', 'product', 'amount', 'status']

const users = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]
  const city = CITIES[index % CITIES.length]

  // The last four columns are intentionally empty lookup placeholders that
  // the merge fills from the orders dataset.
  return [
    id,
    `${firstName} ${lastName}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@example.com`,
    city,
    '',
    '',
    '',
    '',
  ].join(',')
})

const orders = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1
  const product = PRODUCTS[index % PRODUCTS.length]
  const amount = (29 + (index % 9) * 12 + 0.5).toFixed(2)
  const status = STATUSES[index % STATUSES.length]

  return [id, 1000 + id, product, amount, status].join(',')
})

export const SAMPLE_USERS_FILE_NAME = 'sample_users.csv'
export const SAMPLE_ORDERS_FILE_NAME = 'sample_orders.csv'

export const SAMPLE_USERS_CSV = [USER_HEADERS.join(','), ...users].join('\n')
export const SAMPLE_ORDERS_CSV = [ORDER_HEADERS.join(','), ...orders].join('\n')

/** Creates fresh File instances so each demo session starts from clean data. */
export function createSampleFiles(): { users: File; orders: File } {
  return {
    users: new File([SAMPLE_USERS_CSV], SAMPLE_USERS_FILE_NAME, { type: 'text/csv' }),
    orders: new File([SAMPLE_ORDERS_CSV], SAMPLE_ORDERS_FILE_NAME, { type: 'text/csv' }),
  }
}
