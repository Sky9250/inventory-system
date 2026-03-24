# 📦 Inventory Management System

A modern, production-ready inventory management system built with React. Designed for teams of 5-10 people to efficiently manage products, track stock levels, and generate reports.

## ✨ Features

- **Dashboard** - Real-time overview of inventory status with charts and statistics
- **Product Management** - Add, edit, and delete products with full details
- **Stock Tracking** - Monitor stock levels with automatic low-stock alerts
- **Multi-User Access** - Role-based authentication (Admin, Manager, Staff)
- **Reports & Analytics** - Visual charts and exportable CSV reports
- **Search & Filters** - Quickly find products by category, status, or keywords
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🎯 Key Capabilities

- ✅ Create, Read, Update, Delete (CRUD) operations for products
- ✅ Real-time stock level monitoring
- ✅ Low stock and out-of-stock alerts
- ✅ Category and location-based organization
- ✅ Export data to CSV for Excel
- ✅ Interactive charts and visualizations
- ✅ User authentication with different roles
- ✅ Dark theme with modern UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (Download from https://nodejs.org/)
- npm (comes with Node.js)

### Installation

1. **Extract the project files** to a folder on your computer

2. **Open Terminal/Command Prompt** in the project folder
   - Windows: Shift + Right-click in folder → "Open PowerShell window here"
   - Mac: Right-click folder → "New Terminal at Folder"

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to: `http://localhost:3000`

## 👤 Demo Accounts

The system comes with 3 pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Manager | manager@company.com | manager123 |
| Staff | staff@company.com | staff123 |

## 📱 Using the System

### Dashboard
- View total products, stock status, and inventory value
- See charts showing products by category and stock trends
- Monitor recently updated items and top products

### Products Page
- **Add Product**: Click "Add Product" button
- **Edit Product**: Click "Edit" button on any product card
- **Delete Product**: Click "Delete" button (with confirmation)
- **Search**: Type in the search box to find products
- **Filter**: Use dropdowns to filter by category or stock status

### Reports Page
- **Export Full Inventory**: Download complete product list as CSV
- **Export Low Stock**: Download products that need reordering
- **Export by Category**: Download category summary
- View visual charts and analytics

## 📊 Sample Data

The system includes 8 sample products across 3 categories:
- **Electronics**: Laptops, Monitors, Keyboards, Mice, Printers
- **Furniture**: Office Chairs, Standing Desks
- **Office Supplies**: LED Desk Lamps

You can delete these and add your own products!

## 🔧 Customization

### Adding Categories
Edit `src/store/useStore.js` and update the `categories` array:
```javascript
categories: ['Electronics', 'Furniture', 'Office Supplies', 'Your Category'],
```

### Adding Locations
Edit `src/store/useStore.js` and update the `locations` array:
```javascript
locations: ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Your Location'],
```

### Changing Colors
Edit `src/styles/global.css` and modify the CSS variables at the top:
```css
--color-accent-primary: #ff6b35;  /* Change this */
--color-accent-secondary: #f7931e; /* And this */
```

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

This creates a `dist` folder with all files ready to deploy.

## 📦 Project Structure

```
inventory-system/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout.jsx     # Main layout with sidebar
│   │   └── ProductModal.jsx
│   ├── pages/            # Main application pages
│   │   ├── Login.jsx     # Login page
│   │   ├── Dashboard.jsx # Main dashboard
│   │   ├── Products.jsx  # Product management
│   │   └── Reports.jsx   # Reports and analytics
│   ├── store/            # State management
│   │   └── useStore.js   # Zustand store
│   ├── styles/           # CSS files
│   │   ├── global.css    # Global styles and variables
│   │   ├── Dashboard.css
│   │   ├── Products.css
│   │   └── Reports.css
│   ├── utils/            # Utility functions
│   │   └── helpers.js    # Formatting and export functions
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Entry point
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Build configuration
└── README.md            # This file
```

## 🛠️ Technologies Used

- **React 18** - UI framework
- **Vite** - Fast build tool
- **React Router** - Navigation
- **Zustand** - State management
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 🆘 Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Port 3000 already in use
- Change the port in `vite.config.js`:
  ```javascript
  server: {
    port: 3001, // Use different port
  }
  ```

### Changes not showing up
- Stop the server (Ctrl+C)
- Run `npm run dev` again
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## 📝 Notes

- Data is stored in browser localStorage (persists between sessions)
- To reset all data, clear browser localStorage or use browser's "Clear Site Data"
- For production use, connect to a real backend API

## 🔐 Security Note

The demo authentication is for demonstration purposes only. For production use:
- Implement proper backend authentication
- Use secure password hashing
- Add SSL/HTTPS encryption
- Implement proper session management

## 📧 Support

For updates or changes to the system, you can:
1. Make changes to the code
2. Test locally with `npm run dev`
3. Build for production with `npm run build`
4. Deploy the `dist` folder

## 📄 License

This project is provided as-is for your use.

---

**Built with ❤️ using React**
