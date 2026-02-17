# Service Request Management System

A modern, full-featured service request management platform built with Next.js, React, and TypeScript. This application enables employees to submit service requests and allows administrators to track, assign, and manage these requests efficiently.

## Features

### For Employees
- **Submit Service Requests**: Create new service requests with title, description, category, and priority
- **Edit Requests**: Modify pending requests anytime before they are assigned
- **Delete Requests**: Remove pending requests that are no longer needed
- **Track Requests**: View the status of all your submitted requests in real-time
- **Request Management**: Search, filter by status and category, and paginate through requests

### For Administrators
- **View All Requests**: Monitor all service requests across the organization
- **Assign Requests**: Assign requests to team members with automatic notifications
- **Update Status**: Change request status (in-progress, on-hold, resolved, rejected)
- **Analytics Dashboard**: View comprehensive analytics including request trends and resolution metrics

### For Super Administrators
- All admin features plus
- **User Management**: Manage user roles and access levels

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: Shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query (SWR pattern)
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Custom auth context
- **Date Handling**: date-fns
- **Notifications**: Sonner (Toast notifications)
- **Icons**: Lucide React

## Installation

### Prerequisites
- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TestingPurpose
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   
   > **Note**: The `--legacy-peer-deps` flag is used to resolve peer dependency conflicts with certain packages in the dependencies tree.

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout with metadata
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── page.tsx                  # Home page
│   └── dashboard/
│       ├── layout.tsx            # Dashboard layout
│       ├── page.tsx              # Dashboard home
│       ├── requests/
│       │   ├── page.tsx          # View all requests
│       │   ├── new/
│       │   │   └── page.tsx      # Create new request
│       │   ├── edit/
│       │   │   └── [id]/page.tsx # Edit existing request
│       │   └── [id]/
│       │       └── page.tsx      # View request details
│       ├── analytics/
│       ├── notifications/
│       ├── users/
│       ├── lunch/
│       ├── announcements/
│       ├── profile/
│       └── settings/
├── components/
│   ├── ui/                       # Shadcn/ui components
│   ├── dashboard-*.tsx           # Dashboard variants by role
│   ├── login-page.tsx            # Login component
│   └── ...                       # Other components
├── lib/
│   ├── auth-context.tsx          # Authentication context
│   ├── queries.ts                # React Query hooks and mutations
│   ├── data.ts                   # Mock data
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Utility functions
│   └── query-provider.tsx        # Query client setup
├── schemas/
│   └── index.ts                  # Zod validation schemas
├── hooks/
│   └── use-mobile.tsx            # Custom mobile detection hook
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Core Features Explanation

### Request Lifecycle

1. **Create**: Employees submit new requests via the "New Request" form
2. **Edit**: Creators can edit pending requests before assignment
3. **Assign**: Admins assign requests to team members (status changes to "in-progress")
4. **Progress**: Status can be updated to "on-hold" for blocked requests
5. **Resolve**: Mark request as "resolved" when completed
6. **Reject**: Mark request as "rejected" if it cannot be fulfilled

### Authentication & Authorization

The system uses role-based access control:

- **Employee**: Can create, edit (pending only), and view their own requests
- **Admin**: Can view all requests, assign them, and update statuses
- **SuperAdmin**: Full access including user management

### Request Categories

- Food and Supplies
- Office Maintenance
- Cleaning
- Other (with custom specification)

### Request Priority Levels

- **Low**: Non-urgent issues
- **Medium**: Standard priority
- **High**: Urgent issues requiring immediate attention

### Request Statuses

- **Pending**: Newly created, awaiting assignment
- **In Progress**: Actively being worked on
- **On Hold**: Temporarily blocked or waiting
- **Resolved**: Successfully completed
- **Rejected**: Cannot be fulfilled

## Data Management

The application uses mock data stored in memory for demonstration purposes. All data is:

- Validated using Zod schemas
- Managed through React Query for optimal caching and synchronization
- Type-safe with full TypeScript support

## Customization

### Adding New Request Categories

1. Update the `RequestCategory` type in `lib/types.ts`
2. Add the new category to the schema in `schemas/index.ts`
3. Update the category display in form components

### Adding New Permissions

1. Extend the `UserRole` type in `lib/types.ts`
2. Update role checks in components and query hooks
3. Add role-specific UI rendering logic

### Styling

The app uses Tailwind CSS with custom theme colors defined in:
- `tailwind.config.ts`: Theme configuration and color palette
- `app/globals.css`: Global styles and CSS variables

## API Reference

### Query Hooks (Read Operations)

```typescript
// Get all requests (or filtered by user if employee)
useServiceRequests(userId?: string)

// Get single request by ID
useServiceRequest(id: string)

// Get all users
useUsers()

// Get analytics data
useAnalytics()

// Get announcements
useAnnouncements()

// Get notifications
useNotifications(userId?: string)
```

### Mutation Hooks (Write Operations)

```typescript
// Create new request
useCreateRequest()

// Update request details (title, description, category, priority)
useUpdateRequest()

// Delete request
useDeleteRequest()

// Update request status
useUpdateRequestStatus()

// Assign request to team member
useAssignRequest()

// Update user role
useUpdateUserRole()

// Create announcement
useCreateAnnouncement()

// Pin/unpin announcement
usePinAnnouncement()

// Mark notification as read
useMarkNotificationRead()

// Collect lunch token
useCollectLunchToken()
```

## Troubleshooting

### Peer Dependency Warnings

If you encounter peer dependency warnings during installation, use:
```bash
npm install --legacy-peer-deps
```

### Port Already in Use

If port 3000 is already in use, specify a different port:
```bash
npm run dev -- -p 3001
```

### Build Errors

Clear the Next.js cache and rebuild:
```bash
rm -rf .next
npm run build
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

The app includes several performance optimizations:

- **Code Splitting**: Automatic route-based code splitting with Next.js
- **Image Optimization**: Next.js Image component for responsive images
- **Query Caching**: React Query handles smart caching and deduplication
- **Component Lazy Loading**: Dynamic imports for heavy components
- **CSS-in-JS**: Tailwind CSS for optimal CSS delivery

## Development Tips

1. **Hot Reload**: Changes to files are automatically reflected in the browser during development
2. **TypeScript**: Full type safety - hover over elements to see type information
3. **Responsive Design**: Use mobile view in dev tools to test responsive behavior
4. **Component Testing**: Use shadcn/ui components as examples for creating new components

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

This project is part of the internal service management system.

## Support

For issues, questions, or feature requests:
1. Check existing GitHub issues
2. Create a detailed bug report with steps to reproduce
3. Contact the development team

---

**Last Updated**: February 2026
**Version**: 1.0.0
