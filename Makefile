.PHONY: install test dev-backend dev-frontend

install:
	cd backend && npm install
	cd frontend && npm install

test:
	cd backend && npm run test
	cd frontend && npm run test

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev
