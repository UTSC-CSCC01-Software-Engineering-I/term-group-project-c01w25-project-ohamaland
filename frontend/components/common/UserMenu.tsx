import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Badge, Box, Popover, Typography, List, ListItem, ListItemText, IconButton, Divider, Paper, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/utils/auth";
import { notificationsDetailApi, notificationsWS } from "@/utils/api";
import { brand } from "@/styles/colors";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  notification_id: number;
  notification_type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Get auth token from localStorage or wherever it's stored
    const token = getAccessToken();

    if (!token) return;

    // Create WebSocket connection
    const ws = new WebSocket(notificationsWS(token));

    ws.onopen = () => {
      console.log("Connected to notification websocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received from websocket:", data);

      if (data.type === 'stored_notifications') {
        // Initial notifications loaded
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.is_read).length);
      }
      else if (data.type === 'notification') {
        // New notification received
        const newNotification = {
          notification_id: data.notification_id,  // Using notification_id instead of id
          notification_type: data.notification_type,
          title: data.title,  // Using title directly from data
          message: data.message,
          data: data.data,
          is_read: false,
          is_dismissed: false,
          created_at: new Date().toISOString()
        };

        setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
        setUnreadCount(prevCount => prevCount + 1);
      }
      else if (data.type === 'dismiss_response' && data.success) {
        // Remove the dismissed notification
        setNotifications(prevNotifications =>
          prevNotifications.filter(n => n.notification_id !== data.notification_id)
        );
        // Update unread count if needed
        setUnreadCount(prevCount => {
          const notif = notifications.find(n => n.notification_id === data.notification_id);
          return notif && !notif.is_read ? prevCount - 1 : prevCount;
        });
      }
      else if (data.type === 'mark_read_response' && data.success) {
        // Update the read status of notification
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n.notification_id === data.notification_id
              ? { ...n, is_read: true }
              : n
          )
        );
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from notification websocket");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  // Mark a single notification as read
  const markNotificationAsRead = (notificationId: number) => {
    if (!notifications.find(n => n.notification_id === notificationId)?.is_read) {
      const token = getAccessToken();

      // Send via WebSocket if connected
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          action: 'mark_read',
          notification_id: notificationId
        }));
      } else {
        // Fall back to REST API
        fetch(notificationsDetailApi(notificationId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ is_read: true })
        });
      }

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.notification_id === notificationId
            ? { ...n, is_read: true }
            : n
        )
      );
      setUnreadCount(prevCount => prevCount - 1);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    if (notifications.some(n => !n.is_read)) {
      const token = getAccessToken();

      // Mark notifications as read in bulk
      notifications.forEach(notification => {
        if (!notification.is_read) {
          // Send via WebSocket if connected
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              action: 'mark_read',
              notification_id: notification.notification_id
            }));
          } else {
            // Fall back to REST API
            fetch(notificationsDetailApi(notification.notification_id), {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ is_read: true })
            });
          }
        }
      });

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // No longer marking all as read on click
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const dismissNotification = (notificationId: number) => {
    // Send via WebSocket if connected
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        action: 'dismiss_notification',
        notification_id: notificationId
      }));
    } else {
      // Fall back to REST API
      const token = getAccessToken();
      fetch(notificationsDetailApi(notificationId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_dismissed: true })
      })
        .then(response => {
          if (response.ok) {
            // Update local state
            setNotifications(notifications.filter(n => n.notification_id !== notificationId));
            // Update unread count if needed
            setUnreadCount(prevCount => {
              const notif = notifications.find(n => n.notification_id === notificationId);
              return notif && !notif.is_read ? prevCount - 1 : prevCount;
            });
          }
        });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const open = Boolean(anchorEl);
  const hasUnreadNotifications = notifications.some(n => !n.is_read);

  return (
    <Box sx={userMenuStyle}>
      <IconButton
        onClick={handleNotificationClick}
      >
        <Badge badgeContent={unreadCount} color="error" overlap="circular">
          <NotificationsIcon sx={{ color: "white", fontSize: "28px" }} />
        </Badge>
      </IconButton>
      <AccountCircleIcon sx={iconStyle} />

      {/* Notification Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "8px",
          },
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
        slotProps={{
          paper: {
            elevation: 24,
          }
        }}
      >
        <Paper sx={notificationPaperStyle}>
          <Box sx={notificationHeaderStyle}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold' }}
            >
              Notifications
            </Typography>
          </Box>

          <List sx={notificationListStyle}>
            {notifications.length === 0 ? (
              <ListItem key="no-notifications" sx={{ justifyContent: 'center' }}>
                <ListItemText
                  primary="No Notifications"
                  sx={{
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                />
              </ListItem>
            ) : (
              notifications.map((notification, index) => (
                <Box
                  key={notification.notification_id}
                  sx={{
                    width: '100%',
                    padding: '0px 12px'
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      borderRadius: '8px',
                      padding: '8px',
                      backgroundColor: notification.is_read ? 'rgba(0, 0, 0, 0.02)' : 'rgba(25, 118, 210, 0.04)',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: notification.is_read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.08)'
                      }
                    }}
                    onMouseEnter={() => markNotificationAsRead(notification.notification_id)} // Mark as read on hover
                  >
                    <ListItem alignItems="flex-start" sx={{ padding: '4px 8px' }}>
                      {!notification.is_read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: brand.primary,
                            position: 'absolute',
                            left: 6,
                            top: 16,
                          }}
                        />
                      )}
                      <ListItemText
                        sx={{
                          ml: !notification.is_read ? 2 : 0,
                          pr: 3 // Make space for the close button
                        }}
                        primary={
                          <Typography sx={{
                            fontWeight: notification.is_read ? 'normal' : 'bold',
                            color: notification.is_read ? 'text.secondary' : 'text.primary',
                          }}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color={notification.is_read ? 'text.disabled' : 'text.primary'}
                            >
                              {notification.message}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(notification.created_at)}
                            </Typography>
                          </>
                        }
                      />
                      <IconButton
                        edge="end"
                        aria-label="dismiss"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.notification_id);
                        }}
                        sx={{
                          position: 'absolute',
                          right: '8px',
                          top: '8px',
                          padding: '4px',
                        }}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  </Paper>
                </Box>
              ))
            )}
          </List>

          {/* Mark all as read button at the bottom - always shown */}
          <Box sx={{
            paddingX: "16px",
            paddingTop: "4px",
            paddingBottom: "8px",
            justifyContent: 'center',
          }}>
            <Button
              onClick={markAllAsRead}
              variant="text"
              disabled={!hasUnreadNotifications}
              size="small"
              sx={{
                color: hasUnreadNotifications ? '#2196f3' : '#9e9e9e', // Light blue when notifications exist, gray otherwise
                fontSize: '0.8rem',
                padding: '2px 8px',
                minWidth: 'auto',
                '&.Mui-disabled': {
                  color: '#9e9e9e', // Keep gray when disabled
                }
              }}
              startIcon={<DoneAllIcon sx={{ fontSize: '1rem' }} />}
            >
              Mark all as read
            </Button>
          </Box>
        </Paper>
      </Popover>
    </Box>
  );
}

const userMenuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px"
};

const iconStyle = {
  fontSize: 32,
  color: "white",
  cursor: "pointer"
};

const notificationPaperStyle = {
  width: '525px',
  maxHeight: '500px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
};

const notificationHeaderStyle = {
  padding: '10px 16px',
  paddingBottom: '0px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const notificationListStyle = {
  maxHeight: '400px',
  overflow: 'auto',
  padding: '4px 0',
  overflowX: 'hidden',
  overflowY: 'auto',
};