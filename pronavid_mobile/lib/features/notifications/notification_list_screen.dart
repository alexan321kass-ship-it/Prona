import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'notification_provider.dart';

class NotificationListScreen extends StatefulWidget {
  const NotificationListScreen({super.key});

  @override
  State<NotificationListScreen> createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends State<NotificationListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'Marcar todas como leídas',
            onPressed: () {
              context.read<NotificationProvider>().markAllAsRead();
            },
          )
        ],
      ),
      body: Consumer<NotificationProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.notifications.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.notifications.isEmpty) {
            return const Center(child: Text('No tienes notificaciones'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              await provider.fetchNotifications();
            },
            child: ListView.builder(
              itemCount: provider.notifications.length,
              itemBuilder: (context, index) {
                final notif = provider.notifications[index];
                return Dismissible(
                  key: Key(notif.id.toString()),
                  background: Container(color: Colors.green, alignment: Alignment.centerLeft, padding: const EdgeInsets.symmetric(horizontal: 20), child: const Icon(Icons.check, color: Colors.white)),
                  direction: DismissDirection.startToEnd,
                  onDismissed: (direction) {
                    provider.markAsRead(notif.id);
                  },
                  child: Container(
                    color: notif.leida ? Colors.transparent : Theme.of(context).primaryColor.withOpacity(0.05),
                    child: ListTile(
                      leading: Icon(
                        notif.leida ? Icons.notifications_none : Icons.notifications_active,
                        color: notif.leida ? Colors.grey : Theme.of(context).primaryColor,
                      ),
                      title: Text(notif.mensaje, style: TextStyle(fontWeight: notif.leida ? FontWeight.normal : FontWeight.bold)),
                      subtitle: Text(notif.fecha.split('T')[0]),
                      onTap: () {
                        if (!notif.leida) {
                          provider.markAsRead(notif.id);
                        }
                      },
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
