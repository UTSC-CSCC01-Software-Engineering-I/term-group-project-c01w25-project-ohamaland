import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import { Badge, Box, Popover, Typography, List, ListItem, ListItemText, IconButton, Divider, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/utils/auth";
import { notificationsDetailApi, notificationsWS } from "@/utils/api";
import { brand } from "@/styles/colors";
import { formatDistanceToNow } from "date-fns"; 

// Define a notification type that matches our backend model
interface Notification {
  id: number;
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
          id: data.notification_id,
          notification_type: data.notification_type,
          title: data.data?.group_name ? `New receipt in ${data.data.group_name}` : "New Notification",
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
          prevNotifications.filter(n => n.id !== data.notification_id)
        );
        // Update unread count if needed
        setUnreadCount(prevCount => {
          const notif = notifications.find(n => n.id === data.notification_id);
          return notif && !notif.is_read ? prevCount - 1 : prevCount;
        });
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

  // New function to mark notifications as read
  const markNotificationsAsRead = () => {
    if (notifications.some(n => !n.is_read)) {
      const token = getAccessToken();

      // Mark notifications as read in bulk
      notifications.forEach(notification => {
        if (!notification.is_read) {
          // Send via WebSocket if connected
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              action: 'mark_read',
              notification_id: notification.id
            }));
          } else {
            // Fall back to REST API
            fetch(notificationsDetailApi(notification.id), {
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
    markNotificationsAsRead();
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
      const token = localStorage.getItem('authToken');
      fetch(`/api/notifications/${notificationId}/`, {
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
            setNotifications(notifications.filter(n => n.id !== notificationId));
            // Update unread count if needed
            setUnreadCount(prevCount => {
              const notif = notifications.find(n => n.id === notificationId);
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
          <Divider />

          <List sx={notificationListStyle}>
            {notifications.length === 0 ? (
              <ListItem key="no-notifications" sx={{ justifyContent: 'center' }}>
                <ListItemText
                  primary="No Notifications"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            ) : (
              notifications.map((notification, index) => (
                <Box
                  key={notification.id}
                  sx={{ width: '100%' }}
                >
                  <ListItem alignItems="flex-start" sx={notificationItemStyle}>
                    {!notification.is_read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: brand.primary,
                          position: 'absolute',
                          left: 16,
                          top: 18,
                        }}
                      />
                    )}
                    <ListItemText
                      sx={{
                        ml: !notification.is_read ? 2 : 0  // Add margin-left when dot is present
                      }}
                      primary={
                        <Typography sx={{
                          fontWeight: notification.is_read ? 'normal' : 'bold',
                          color: notification.is_read ? 'text.secondary' : 'text.primary' // Lighter text for read notifications
                        }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color={notification.is_read ? 'text.disabled' : 'text.primary'} // Lighter text for read notifications
                          >
                            {notification.message}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {formatDate(notification.created_at)}
                          </Typography>
                        </>
                      }
                    />
                    <IconButton
                      edge="end"
                      aria-label="dismiss"
                      onClick={() => dismissNotification(notification.id)}
                      sx={dismissButtonStyle}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItem>

                  {/* Only render divider if this is not the last item */}
                  {index < notifications.length - 1 && (
                    <Divider
                      component="li"
                      sx={{
                        margin: '0 auto',
                        width: '90%'
                      }}
                    />
                  )}
                </Box>
              ))
            )}
          </List>
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
  width: '450px',
  maxHeight: '500px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
};

const notificationHeaderStyle = {
  padding: '10px 16px',
  paddingBottom: '5px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const notificationListStyle = {
  maxHeight: '400px',
  overflow: 'auto',
  padding: 0,
  overflowX: 'hidden',
  overflowY: 'auto',
};

const notificationItemStyle = {
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  },
  position: 'relative',
  paddingRight: '40px'
};

const dismissButtonStyle = {
  position: 'absolute',
  right: '20px',
  top: '8px'
};