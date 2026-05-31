import axios from 'axios'

export const adminClient = axios.create({
  baseURL: 'http://YOUR_ADMIN_SERVICE_IP',
  headers: { 'Content-Type': 'application/json' }
})

export const appClient = axios.create({
  baseURL: 'http://20.242.154.139',
  headers: { 'Content-Type': 'application/json' }
})

export const applicantClient = axios.create({
  baseURL: 'http://20.84.30.112',
  headers: { 'Content-Type': 'application/json' }
})