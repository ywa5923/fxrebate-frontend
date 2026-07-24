import { getBrokerDefaultTeam } from '@/lib/team-requests';
import { isAuthenticated,  getBrokerInfo } from '@/lib/auth-actions';
import { canManageBroker } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import logger from '@/lib/logger';
import { TeamUser, BrokerTeam } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Plus,
  UserPlus,
  Crown,
  Clock
} from 'lucide-react';
import { AddMemberDialog } from './AddMemberDialog';
import { UserActions } from './UserActions';


interface TeamManagementPageProps {
  params: Promise<{ brokerId: string }>;
}

//http://localhost:3000/en/control-panel/185/broker-profile/team-management
export default async function TeamManagementPage({ params }: TeamManagementPageProps) {
  const pageLogger = logger.child('control-panel/[brokerId]/broker-profile/team-management/page.tsx');
  
  // Check authentication
  const loggedUser = await isAuthenticated();
  if (!loggedUser) {
    redirect('/en');
  }
 

  const resolvedParams = await params;
  const brokerId = parseInt(resolvedParams.brokerId);
  const brokerInfo = await getBrokerInfo(brokerId);


  //isManager means the logged in user has permission to manage the broker: broker:manage:{brokerId} or is platform admin or superadmin
  const isManager = canManageBroker(loggedUser,brokerInfo);

  if (!isManager) {
    pageLogger.error('User does not have permission to access team management', {
      userId: loggedUser.id,
      userType: loggedUser.user_type,
      brokerId
    });
    redirect(`/en/control-panel/${brokerId}/broker-profile/1/general-information`);
  }


  

  // Fetch team data
  const teamResponse = await getBrokerDefaultTeam(brokerId);
  const team: BrokerTeam = teamResponse.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Team Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Manage your broker team members and permissions</p>
          </div>
          <div className="flex flex-col  sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <AddMemberDialog brokerId={brokerId} />
          </div>
        </div>

        {/* Team Overview Card */}
        <Card className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border dark:border-gray-800 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{team.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">{team.description}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 space-x-2 sm:space-x-4">
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                      <Users className="h-3 w-3 mr-1" />
                      {team.users.length} Members
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                      {team.is_active ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">{team.users.length}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.users.map((user: TeamUser) => (
            <Card key={user.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 border dark:border-gray-800">
              <CardContent className="p-6">
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-green-600 dark:from-gray-700 dark:to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate">{user.name}</h3>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  {/* Only show edit/delete actions for other users,not for logged in team user */}
                  {/*If the logged in user has same id as team user,he is a team user */}
                  {/*This page is shown only for permision.action === 'manage' */}
                  {/*So if the ids are same,logged in user is a team user with permission.action === 'manage' */}
                  {isManager && loggedUser.id != user.id && <UserActions brokerId={brokerId} user={user} />}
                </div>

                {/* User Status */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge 
                    variant={user.is_active ? "default" : "secondary"}
                    className={user.is_active ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"}
                  >
                    {user.is_active ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                    )}
                  </Badge>
                  {user.email_verified_at && (
                    <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Last Login */}
                <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 min-h-[24px]">
                  {user.last_login_at ? (
                    <>
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Last login: {new Date(user.last_login_at).toLocaleString()}
                    </>
                  ) : null}
                </div>

                {/* Permissions */}
                {user.resource_permissions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Permissions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.resource_permissions.map((permission) => (
                        <Badge 
                          key={permission.id} 
                          variant="outline" 
                          className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        >
                          {permission.action === 'manage' && <Crown className="h-3 w-3 mr-1" />}
                          {permission.action} {permission.permission_type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {/* Add Member Card */}
          <AddMemberDialog brokerId={brokerId}>
            <div
              role="button"
              tabIndex={0}
              className="group flex w-full flex-col items-center justify-center min-h-[200px] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 p-6 text-card-foreground shadow-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-900 hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
            >
              <div className="w-11 h-11 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 flex items-center justify-center mb-4 transition-colors">
                <Plus className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1">Add New Member</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-[200px]">Invite someone to join your broker team</p>
            </div>
          </AddMemberDialog>
        </div>

        {/* Empty State */}
        {team.users.length === 0 && (
          <Card className="text-center py-12 bg-white dark:bg-gray-900 border dark:border-gray-800">
            <CardContent>
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Team Members</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by adding your first team member</p>
              <AddMemberDialog brokerId={brokerId}>
                <Button
                  variant="outline"
                  className="h-10 px-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <UserPlus className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                  Add First Member
                </Button>
              </AddMemberDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
