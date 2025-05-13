import { requireAdmin } from "@/lib/auth-helpers"
import AdminLayout from "@/components/admin/layout"

export default async function AdminHelpPage() {
  // This will redirect if not an admin
  await requireAdmin()

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Interface Documentation</h1>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <p>
              Welcome to the ARQUILITAS Admin Interface. This dashboard provides you with tools to manage users,
              products, orders, and site settings. As an administrator, you have access to all features of the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Accessing the Admin Interface</h2>
            <p>To access the admin interface:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Log in with your admin account credentials</li>
              <li>
                After successful login, you will be automatically redirected to the admin dashboard if you have admin
                privileges
              </li>
              <li>
                Alternatively, click on your username in the top navigation bar and select &quot;Admin Dashboard&quot;
                from the dropdown menu
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
            <p>The dashboard provides an overview of your website&apos;s performance, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Total number of users</li>
              <li>Total number of products</li>
              <li>Total number of orders</li>
              <li>Recent orders with customer information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p>
              The User Management section allows you to view and manage all registered users. To access this section,
              click on &quot;Users&quot; in the sidebar.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">Viewing Users</h3>
            <p>
              The users page displays a table with all registered users, including their name, email, role, and
              registration date.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">Editing Users</h3>
            <p>To edit a user:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click the edit (pencil) icon next to the user you want to edit</li>
              <li>In the dialog that appears, you can modify the user&apos;s name and role</li>
              <li>Click &quot;Save changes&quot; to apply your changes</li>
            </ol>
            <h3 className="text-lg font-medium mt-4 mb-2">Changing User Roles</h3>
            <p>
              You can change a user&apos;s role between &quot;user&quot; and &quot;admin&quot;. Admin users have access
              to the admin interface, while regular users do not.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">Deleting Users</h3>
            <p>To delete a user:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click the delete (trash) icon next to the user you want to delete</li>
              <li>Confirm the deletion in the dialog that appears</li>
            </ol>
            <p className="text-red-600 mt-2">
              Warning: Deleting a user is permanent and cannot be undone. All data associated with the user will be
              deleted.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Adding Admin Collaborators</h2>
            <p>To add a new admin collaborator:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Ensure the user has registered for an account</li>
              <li>Go to the Users section in the admin interface</li>
              <li>Find the user you want to make an admin</li>
              <li>Click the edit (pencil) icon next to their name</li>
              <li>Change their role from &quot;user&quot; to &quot;admin&quot;</li>
              <li>Click &quot;Save changes&quot;</li>
            </ol>
            <p>
              The user will now have admin privileges and can access the admin interface by logging in and clicking on
              their username in the navigation bar.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Security Best Practices</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only grant admin access to trusted individuals</li>
              <li>Regularly review the list of admin users</li>
              <li>Use strong, unique passwords for admin accounts</li>
              <li>Log out when you&apos;re done using the admin interface</li>
              <li>Periodically change your admin password</li>
            </ul>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
