"use client";

import { useSession, signOut } from "next-auth/react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { Small } from "./Typography";
import LogoutIcon from "@mui/icons-material/Logout";

export function UserAvatar() {
  const { data: session } = useSession();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  if (!session?.user) return null;

  return (
    <>
      <Avatar
        src={session.user.image ?? undefined}
        alt={session.user.name ?? "User"}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          width: 34,
          height: 34,
          cursor: "pointer",
          border: "2px solid",
          borderColor: "primary.main",
        }}
      />
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200, mt: 1 } }}
      >
        <Box px={2} py={1}>
          <Small fontWeight={700}>{session.user.name}</Small>
          <Small display="block" color="text.disabled" fontSize={11}>
            {session.user.email}
          </Small>
        </Box>
        <MenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{ gap: 1, color: "error.main", fontWeight: 700, fontSize: 14 }}
        >
          <LogoutIcon fontSize="small" />
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}