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
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useState, useEffect, useMemo } from "react";
import { signOut } from "next-auth/react";
import Navuserwrapper from "../ui/Navuserwrapper";
import Link from "next/link";
import useUser from "../hooks/useUser";

// --- Iconos ---
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

// --- Icono de Stockly (Logo) ---
const StocklyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2} // Un poco más grueso para el logo
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h16.5M3.75 3v16.5M16.5 3v11.25A2.25 2.25 0 0114.25 16.5h-8.25M12 16.5v4.5m0-4.5h4.5m-4.5 0H7.5"
    />
  </svg>
);


interface Props {
  window?: () => Window;
}

type NavItem = { link: string; name: string; icon: React.ReactElement };

const drawerWidth = 240;

function getNavItems(): NavItem[] {
  return [
    { link: "/", name: "Home", icon: <HomeIcon /> },
    { link: "users", name: "Usuarios", icon: <GroupIcon /> },
  ];
}

export default function DrawerAppBar(props: Props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  // --- ¡CORRECCIÓN AQUÍ! ---
  // Se llama a getNavItems sin argumentos, ya que no depende del rol del usuario
  const navItems = useMemo(() => getNavItems(), []);

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
        <Typography variant="h6" sx={{ my: 2, fontWeight: 600 }}>
          Stockly Admin
        </Typography>
        <Divider />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <List>
          {navItems.map((item) => (
            <Link
              href={`/${item.link.toLowerCase()}`}
              key={item.name}
              className="w-full"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} sx={{ textAlign: 'left' }} />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
          <Divider sx={{ my: 1 }} />
          {user ? (
            <>
              <ListItem disablePadding>
                <Link href="/profile" className="w-full" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItemButton>
                    <ListItemIcon sx={{ minWidth: '40px' }}><AccountCircleIcon /></ListItemIcon>
                    <ListItemText primary="Mi Perfil" sx={{ textAlign: 'left' }} />
                  </ListItemButton>
                </Link>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => signOut({ callbackUrl: "/login" })}>
                  <ListItemIcon sx={{ minWidth: '40px' }}><LogoutIcon color="error" /></ListItemIcon>
                  <ListItemText primary="Cerrar Sesión" sx={{ textAlign: 'left', color: 'error.main' }} />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <ListItem disablePadding>
              <Link href="/login" className="w-full" style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton>
                  <ListItemIcon sx={{ minWidth: '40px' }}><AccountCircleIcon /></ListItemIcon>
                  <ListItemText primary="Iniciar Sesión" sx={{ textAlign: 'left' }} />
                </ListItemButton>
              </Link>
            </ListItem>
          )}
        </List>
      </Box>
      <Box sx={{ mt: "auto", p: 2, borderTop: "1px solid rgba(0,0,0,0.08)", bgcolor: 'grey.50' }}>
        {user ? (
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {user?.nombre ?? "Usuario"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email ?? ""}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No autenticado
          </Typography>
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
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" }, color: 'grey.800' }}
          >
            <MenuIcon />
          </IconButton>

          {/* --- TÍTULO ACTUALIZADO --- */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              verticalAlign: "middle",
            }}
          >
            <Link href="/" className="text-decoration-none" style={{ display: 'flex', alignItems: 'center' }}>
              {/* 1. Vuelve el logo de Stockly */}
              <StocklyIcon
                width={30}
                height={30}
                style={{ color: "var(--color-primario, #1976D2)", marginRight: '12px' }}
              />
              {/* 2. Nombre de la App */}
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: "var(--color-primario, #1976D2)", // Mantenemos el azul de la marca
                  fontWeight: "bold",
                  fontSize: { sm: "2rem", xs: "1.5rem" },
                }}
              >
                Stockly
              </Typography>
              {/* 3. "Tag" de Admin sutil */}
              <Box sx={{
                ml: 2,
                bgcolor: 'grey.200',
                color: 'grey.700',
                px: 1.5,
                py: 0.5,
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: { xs: 'none', sm: 'block' } // Oculto en móviles
              }}>
                Admin
              </Box>
            </Link>

            {/* Links de Navegación */}
            <Box sx={{ display: { xs: "none", md: "block" }, ml: 4 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    href={`/${item.link.toLowerCase()}`}
                    LinkComponent={Link}
                    startIcon={item.icon}
                    sx={{
                      color: 'grey.700',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {user ? (
              <Navuserwrapper
                name={user?.nombre || ""}
                email={user?.email || ""}
                logoutButton={
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    sx={{ ml: 2, textTransform: 'none', boxShadow: 'none' }}
                  >
                    Cerrar sesión
                  </Button>}
              />
            ) : (
              <Button
                href="/login"
                component={Link}
                variant="contained"
                sx={{ textTransform: 'none', boxShadow: 'none' }}
              >
                Iniciar Sesión
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
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