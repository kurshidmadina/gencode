import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login"
  },
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) return token?.role === "ADMIN";
      return Boolean(token);
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/settings/:path*", "/admin/:path*"]
};
