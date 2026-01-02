import { getBrokerDefaultTeam } from '@/lib/team-requests';
import { isAuthenticated,  getBrokerInfo } from '@/lib/auth-actions';
import { canManageBroker } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import logger from '@/lib/logger';
import { TeamUser, BrokerTeam } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Mail, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Plus,
  UserPlus,
  Settings,
  Crown,
  Clock
} from 'lucide-react';
import { AddMemberDialog } from './AddMemberDialog';
import { UserActions } from './UserActions';
import { hasPermission } from '@/lib/permissions';

interface TeamManagementPageProps {
  params: Promise<{ brokerId: string }>;
}

//http://localhost:3000/en/control-panel/185/broker-profile/team-management
export default async function TeamManagementPage({ params }: TeamManagementPageProps) {
  const pageLogger = logger.child('control-panel/[brokerId]/broker-profile/team-management/page.tsx');
  
  // Check authentication
  const loggedUser = await isAuthenticated();
  if (!loggedUser) {
    pageLogger.warn('User not authenticated, redirecting to login',{user_id: loggedUser?.id,user_email: loggedUser?.email,user_name: loggedUser?.name});
    redirect('/en');
  }
 

  const resolvedParams = await params;
  const brokerId = parseInt(resolvedParams.brokerId);
  const brokerInfo = await getBrokerInfo(brokerId);


  const canAdmin= canManageBroker(brokerId,loggedUser,brokerInfo)

  if (!canAdmin) {
    pageLogger.warn('!!!!!!!!User does not have permission to access team management', {
      userId: loggedUser.id,
      brokerId
    });
    //redirect(`/en/control-panel/${brokerId}/broker-profile/1/general-information`);
  }
  

  // Fetch team data
  const teamResponse = await getBrokerDefaultTeam(brokerId);
  const team: BrokerTeam = teamResponse.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your broker team members and permissions</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <AddMemberDialog brokerId={brokerId} />
            <Button variant="outline" className="w-full sm:w-auto">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Team Overview Card */}
        <Card className="bg-white text-gray-800 border shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{team.name}</h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">{team.description}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 space-x-2 sm:space-x-4">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                      <Users className="h-3 w-3 mr-1" />
                      {team.users.length} Members
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
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
                <div className="text-3xl sm:text-4xl font-bold text-gray-800">{team.users.length}</div>
                <div className="text-gray-600 text-sm">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.users.map((user: TeamUser) => (
            <Card key={user.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{user.name}</h3>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500 truncate">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  {/* Only show edit/delete actions for other users,not for logged in team user */}
                  {/*If the logged in user has same id as team user,he is a team user */}
                  {/*This page is shown only for permision.action === 'manage' */}
                  {/*So if the ids are same,logged in user is a team user with permission.action === 'manage' */}
                  {loggedUser.id != user.id && <UserActions user={user} />}
                </div>

                {/* User Status */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge 
                    variant={user.is_active ? "default" : "secondary"}
                    className={user.is_active ? "bg-gray-100 text-gray-800" : "bg-red-50 text-red-600"}
                  >
                    {user.is_active ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                    )}
                  </Badge>
                  {user.email_verified_at && (
                    <Badge variant="outline" className="text-gray-600 border-gray-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Last Login */}
                <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-4 min-h-[24px]">
                  {user.last_login_at ? (
                    <>
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Last login: {new Date(user.last_login_at).toLocaleDateString()}
                    </>
                  ) : null}
                </div>

                {/* Permissions */}
                {user.resource_permissions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Permissions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.resource_permissions.map((permission) => (
                        <Badge 
                          key={permission.id} 
                          variant="outline" 
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
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
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center mb-4 transition-colors">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-600 group-hover:text-gray-800 mb-2">Add New Member</h3>
                <p className="text-sm text-gray-500 text-center">Invite a new team member to join your broker team</p>
              </CardContent>
            </Card>
          </AddMemberDialog>
        </div>

        {/* Empty State */}
        {team.users.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Team Members</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first team member</p>
              <Button className="bg-gray-700 hover:bg-gray-800 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}