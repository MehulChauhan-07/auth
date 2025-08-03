// src/pages/auth/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { userAPI } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  Camera,
  Key,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    phoneNumber: "",
    location: "",
    website: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || user.name?.split(" ")[0] || "",
        lastName: user.lastName || user.name?.split(" ")[1] || "",
        email: user.email || "",
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
        location: user.location || "",
        website: user.website || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        phoneNumber: profileData.phoneNumber,
        location: profileData.location,
        website: profileData.website,
      };

      const response = await userAPI.updateProfile(updateData);

      if (response.data.success) {
        await updateUser(response.data.user);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        setSuccess("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
    // Reset form data to original values
    if (user) {
      setProfileData({
        firstName: user.firstName || user.name?.split(" ")[0] || "",
        lastName: user.lastName || user.name?.split(" ")[1] || "",
        email: user.email || "",
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
        location: user.location || "",
        website: user.website || "",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {(error || success) && (
          <div className="mb-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>Save</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-muted rounded-md">
                      {profileData.firstName || "Not set"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-muted rounded-md">
                      {profileData.lastName || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <p className="px-3 py-2 bg-muted rounded-md flex-1">
                    {profileData.email}
                  </p>
                  <Badge
                    variant={user.isAccountVerified ? "default" : "secondary"}
                  >
                    {user.isAccountVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {profileData.phoneNumber || "Not set"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    placeholder="New York, NY"
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {profileData.location || "Not set"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {profileData.website || "Not set"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md min-h-[76px]">
                    {profileData.bio || "Not set"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Security</span>
                </CardTitle>
                <CardDescription>
                  Monitor your account security status and settings
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Your email address verification status
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={user.isAccountVerified ? "default" : "secondary"}
                  >
                    {user.isAccountVerified ? (
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1">
                        <XCircle className="h-3 w-3" />
                        <span>Unverified</span>
                      </span>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Additional security for your account
                      </p>
                    </div>
                  </div>
                  <Badge variant={user.mfaEnabled ? "default" : "outline"}>
                    {user.mfaEnabled ? (
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Enabled</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1">
                        <XCircle className="h-3 w-3" />
                        <span>Disabled</span>
                      </span>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>
                  Update your account password for better security
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!showPasswordForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full"
                  >
                    Change Password
                  </Button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex-1"
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
