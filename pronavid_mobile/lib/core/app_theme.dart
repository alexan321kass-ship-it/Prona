import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

@immutable
class AppColors extends ThemeExtension<AppColors> {
  final Color success;
  final Color warning;
  final Color info;
  final Color pending;
  final Color processing;
  final Color delivered;
  final Color cancelled;

  const AppColors({
    required this.success,
    required this.warning,
    required this.info,
    required this.pending,
    required this.processing,
    required this.delivered,
    required this.cancelled,
  });

  @override
  AppColors copyWith({
    Color? success,
    Color? warning,
    Color? info,
    Color? pending,
    Color? processing,
    Color? delivered,
    Color? cancelled,
  }) {
    return AppColors(
      success: success ?? this.success,
      warning: warning ?? this.warning,
      info: info ?? this.info,
      pending: pending ?? this.pending,
      processing: processing ?? this.processing,
      delivered: delivered ?? this.delivered,
      cancelled: cancelled ?? this.cancelled,
    );
  }

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) {
    if (other is! AppColors) return this;
    return AppColors(
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      info: Color.lerp(info, other.info, t)!,
      pending: Color.lerp(pending, other.pending, t)!,
      processing: Color.lerp(processing, other.processing, t)!,
      delivered: Color.lerp(delivered, other.delivered, t)!,
      cancelled: Color.lerp(cancelled, other.cancelled, t)!,
    );
  }
}

extension StatusColorExtension on String {
  Color getOrderColor(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>();
    if (appColors == null) return Colors.grey;
    
    switch (toLowerCase()) {
      case 'pendiente': return appColors.pending;
      case 'en proceso': return appColors.processing;
      case 'en_proceso': return appColors.processing;
      case 'entregado': return appColors.delivered;
      case 'cancelado': return appColors.cancelled;
      default: return Colors.grey;
    }
  }
}

class AppTheme {
  // Paleta Pronavid Premium (Rojo vibrante + Naranja enérgico)
  static const Color primary = Color(0xFFE31E24); // Rojo Pronavid
  static const Color primaryLight = Color(0xFFFF5252);
  static const Color primaryDark = Color(0xFFB71C1C);
  
  static const Color secondary = Color(0xFFF7941D); // Naranja Pronavid
  static const Color accent = Color(0xFF25D366); // Verde WhatsApp
  
  // Escala de grises moderna
  static const Color background = Color(0xFFFFFFFF);
  static const Color cardColor = Color(0xFFFFFFFF);
  static const Color textMain = Color(0xFF1A1C1E);
  static const Color textMuted = Color(0xFF42474E);
  static const Color textLight = Color(0xFF72777F);
  static const Color border = Color(0xFFE0E0E0);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: primary,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: cardColor,
        error: primaryDark,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        surfaceContainerHighest: const Color(0xFFF5F5F5),
      ),
      extensions: const [
        AppColors(
          success: Color(0xFF2E7D32),
          warning: Color(0xFFED6C02),
          info: Color(0xFF0288D1),
          pending: Color(0xFF757575),
          processing: Color(0xFFF7941D),
          delivered: Color(0xFF2E7D32),
          cancelled: Color(0xFFE31E24),
        ),
      ],
      textTheme: GoogleFonts.plusJakartaSansTextTheme().apply(
        bodyColor: textMain,
        displayColor: textMain,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: textMain,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
        titleTextStyle: GoogleFonts.oswald(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: textMain,
          letterSpacing: 0.5,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: const StadiumBorder(), // Pill shape
          textStyle: GoogleFonts.oswald(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.2,
          ),
        ).copyWith(
          overlayColor: WidgetStateProperty.all(Colors.white.withOpacity(0.1)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF8F9FA),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: primaryDark, width: 1.5),
        ),
        labelStyle: GoogleFonts.plusJakartaSans(color: textLight, fontWeight: FontWeight.w500),
        hintStyle: GoogleFonts.plusJakartaSans(color: textLight, fontSize: 14),
        prefixIconColor: textLight,
      ),
      cardTheme: CardThemeData(
        color: cardColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
          side: const BorderSide(color: border, width: 1),
        ),
        clipBehavior: Clip.antiAlias,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: cardColor,
        selectedItemColor: primary,
        unselectedItemColor: textLight,
        type: BottomNavigationBarType.fixed,
        elevation: 10,
        selectedLabelStyle: GoogleFonts.oswald(fontWeight: FontWeight.w600, fontSize: 12, letterSpacing: 0.5),
        unselectedLabelStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w500, fontSize: 11),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: secondary,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }
}
