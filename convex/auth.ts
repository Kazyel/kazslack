import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

const CustomPassword = Password<DataModel>({
    profile(params) {
        return {
            email: params.email as string,
            name: params.name as string,
        };
    },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        GitHub({
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            clientId: process.env.AUTH_GITHUB_ID,
        }),
        Google({
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            clientId: process.env.AUTH_GOOGLE_ID,
        }),
        CustomPassword,
    ],
});
