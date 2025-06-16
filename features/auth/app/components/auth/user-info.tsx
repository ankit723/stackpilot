import { ExtendedUser } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const UserInfo = ({ user }: { user: ExtendedUser }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Info</CardTitle>
            </CardHeader>
            <CardContent>
                <p>ID: {user.id}</p>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <p>Two Factor Enabled: {user.isTwoFactorEnabled ? "Yes" : "No"}</p>
            </CardContent>
        </Card>
    )
}