"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState, useEffect, useMemo } from "react";
import { signOut } from "next-auth/react";
import Navuserwrapper from "../ui/Navuserwrapper";
import Navlink from "../ui/Navlink";
import Link from "next/link";
import useUser from "../hooks/useUser";

interface Props {
  window?: () => Window;
}

type NavItem = { link: string; name: string };

const drawerWidth = 240;

/**
 * Devuelve los items de navegación según el id del rol del usuario.
 * 1 = admin | 2 = vendedor | 3 = bodeguero
 */
function getNavItems(idRol?: number): NavItem[] {
  const base: NavItem[] = [{ link: "", name: "Home" }];

  const roles: Record<number, NavItem[]> = {
    1: [ //Admin
      { link: "bodega", name: "Bodega" },
      { link: "ventas", name: "Ventas" },
      { link: "dashboard", name: "Dashboard" },
      { link: "admin", name: "Administración" },
    ],
    2: [{ link: "ventas", name: "Ventas" }], //Vendedor
    3: [{ link: "bodega", name: "Bodega" }], //Bodeguero
  };

  return [...base, ...(roles[idRol ?? 0] || [])];
}

export default function DrawerAppBar(props: Props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  // recalcula solo cuando cambia el id de rol
  const navItems = useMemo(() => getNavItems(user?.id_tipo), [user?.id_tipo]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ my: 2 }}>
          Menú
        </Typography>
        <Divider />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <List>
          {navItems.map((item) => (
            <Link
              href={`/${item.link.toLowerCase()}`}
              key={`${item.link}-${item.name}`}
              className="w-full"
            >
              <ListItem disablePadding>
                <ListItemButton sx={{ textAlign: "center" }}>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}

          <Divider />

          {user ? (
            <>
              <ListItem disablePadding>
                <Link href="/profile" className="w-full">
                  <ListItemButton sx={{ textAlign: "center" }}>
                    <ListItemText primary="Mi Perfil" />
                  </ListItemButton>
                </Link>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ textAlign: "center" }}
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <ListItem disablePadding>
              <Link href="/login" className="w-full">
                <ListItemButton sx={{ textAlign: "center" }}>
                  <ListItemText primary="Iniciar Sesión" />
                </ListItemButton>
              </Link>
            </ListItem>
          )}
        </List>
      </Box>

      <Box sx={{ mt: "auto", p: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        {user ? (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {user?.nombre ?? "Usuario"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email ?? ""}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Link href="/login" className="w-full">
              <ListItemButton>
                <ListItemText primary="Iniciar Sesión" />
              </ListItemButton>
            </Link>
          </Box>
        )}
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  if (!mounted) return null;

  return (
    <Box sx={{ display: "flex", backgroundColor: "white" }}>
      <CssBaseline />
      <AppBar
        className="xl:px-[15%]"
        component="nav"
        sx={{
          backgroundColor: "white",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              verticalAlign: "middle",
            }}
          >
            <Link href="/" className="text-decoration-none">
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: "var(--color-primario)",
                  fontWeight: "bold",
                  fontSize: { sm: "2rem", xs: "1.5rem" },
                }}
              >
                Stockly
              </Typography>
            </Link>
            <Box sx={{ display: { xs: "none", md: "block" }, ml: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                {navItems.map((item) => (
                  <Navlink
                    key={`${item.link}-${item.name}`}
                    href={`/${item.link.toLowerCase()}`}
                    text={item.name}
                  />
                ))}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {user ? (
              <Navuserwrapper name={user?.nombre || ""} email={user?.email || ""} />
            ) : (
              <Navlink href="/login" text="Iniciar Sesión" />
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <nav className="bg-color-white">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}
