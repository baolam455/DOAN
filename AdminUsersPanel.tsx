import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  AdminAccountStatus,
  AdminRole,
  AdminUser,
  AdminUserDraft,
  accountStatusLabel,
  formatDateTime,
  roleLabel,
} from "../../../services/adminApi";
import { colors } from "../../../theme";

type Props = {
  users: AdminUser[];
  onAddUser: (input: AdminUserDraft) => void;
  onDeleteUser: (userId: string) => void;
  onChangeRole: (userId: string, role: AdminRole) => void;
  onChangeStatus: (userId: string, status: AdminAccountStatus) => void;
};

const roles: ("all" | AdminRole)[] = [
  "all",
  "admin",
  "dispatcher",
  "warehouse",
  "shipper",
  "customer",
];

const roleOptions: AdminRole[] = [
  "admin",
  "dispatcher",
  "warehouse",
  "shipper",
  "customer",
];

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

function statusTone(status: AdminAccountStatus) {
  if (status === "active") return styles.statusActive;
  if (status === "locked_short") return styles.statusWarning;
  return styles.statusDanger;
}

export default function AdminUsersPanel({
  users,
  onAddUser,
  onDeleteUser,
  onChangeRole,
  onChangeStatus,
}: Props) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AdminRole>("customer");
  const [warehouseName, setWarehouseName] = useState("");
  // Mat khau tao moi
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  // Lỗi form tạo user
  const [createErrors, setCreateErrors] = useState({ password: "", confirm: "" });
  // deleteTarget: user đang chờ xác nhận xóa — thay thế browser confirm()
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const filteredUsers = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesQuery =
        !cleanQuery ||
        user.fullName.toLowerCase().includes(cleanQuery) ||
        user.email.toLowerCase().includes(cleanQuery) ||
        user.phone.includes(cleanQuery);

      return matchesRole && matchesQuery;
    });
  }, [query, roleFilter, users]);

  const handleAddUser = () => {
    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Validate cac truong bat buoc
    if (!cleanFullName || !cleanEmail || !cleanPhone) return;

    // Validate mat khau
    const pwErrors = { password: "", confirm: "" };
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

    if (!password) {
      pwErrors.password = "Vui lòng nhập mật khẩu tạm";
    } else if (!pwRegex.test(password)) {
      pwErrors.password = "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    if (!confirmPassword) {
      pwErrors.confirm = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      pwErrors.confirm = "Mật khẩu xác nhận không khớp";
    }

    if (pwErrors.password || pwErrors.confirm) {
      setCreateErrors(pwErrors);
      return;
    }

    setCreateErrors({ password: "", confirm: "" });

    onAddUser({
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      role,
      password,
      warehouseName: warehouseName.trim() || undefined,
    });

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setRole("customer");
    setWarehouseName("");
    setShowCreate(false);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Quản lý người dùng</Text>
          <Text style={styles.panelDesc}>Chỉnh sửa role, khóa ngắn hạn hoặc khóa dài hạn</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.createButton, webNoOutline]}
          onPress={() => setShowCreate((prev) => !prev)}
        >
          <MaterialCommunityIcons name="account-plus-outline" size={18} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Thêm người dùng</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={19} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, webNoOutline]}
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm theo tên, email, số điện thoại"
            placeholderTextColor={colors.textSubtle}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {roles.map((item) => {
            const active = item === roleFilter;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.82}
                style={[styles.filterChip, active && styles.filterChipActive, webNoOutline]}
                onPress={() => setRoleFilter(item)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item === "all" ? "Tất cả" : roleLabel(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {showCreate && (
        <View style={styles.createBox}>
          <TextInput
            style={[styles.createInput, webNoOutline]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Họ tên / Tên shop"
            placeholderTextColor={colors.textSubtle}
          />
          <TextInput
            style={[styles.createInput, webNoOutline]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholder="Email"
            placeholderTextColor={colors.textSubtle}
          />
          <TextInput
            style={[styles.createInput, webNoOutline]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại"
            placeholderTextColor={colors.textSubtle}
          />
          <TextInput
            style={[styles.createInput, webNoOutline]}
            value={warehouseName}
            onChangeText={setWarehouseName}
            placeholder="Kho/bưu cục phụ trách (tuỳ chọn)"
            placeholderTextColor={colors.textSubtle}
          />

          {/* Mat khau tam — bat buoc de user co the dang nhap */}
          <View style={[styles.passwordBox, createErrors.password ? styles.passwordBoxError : null]}>
            <TextInput
              style={[styles.passwordInput, webNoOutline]}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (createErrors.password) setCreateErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="Mật khẩu tạm (bắt buộc)"
              placeholderTextColor={colors.textSubtle}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.eyeButton}
              onPress={() => setPasswordVisible((v) => !v)}
            >
              <MaterialCommunityIcons
                name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                size={19}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {createErrors.password ? (
            <Text style={styles.createErrorText}>{createErrors.password}</Text>
          ) : null}

          <View style={[styles.passwordBox, createErrors.confirm ? styles.passwordBoxError : null]}>
            <TextInput
              style={[styles.passwordInput, webNoOutline]}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                if (createErrors.confirm) setCreateErrors((p) => ({ ...p, confirm: "" }));
              }}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor={colors.textSubtle}
              secureTextEntry={!confirmVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.eyeButton}
              onPress={() => setConfirmVisible((v) => !v)}
            >
              <MaterialCommunityIcons
                name={confirmVisible ? "eye-off-outline" : "eye-outline"}
                size={19}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {createErrors.confirm ? (
            <Text style={styles.createErrorText}>{createErrors.confirm}</Text>
          ) : null}

          <View style={styles.roleCreateRow}>
            {roleOptions.map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.82}
                style={[styles.roleCreateChip, role === item && styles.roleCreateChipActive, webNoOutline]}
                onPress={() => setRole(item)}
              >
                <Text style={[styles.roleCreateText, role === item && styles.roleCreateTextActive]}>
                  {roleLabel(item)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.82}
            style={[styles.saveCreateButton, webNoOutline]}
            onPress={handleAddUser}
          >
            <Text style={styles.saveCreateText}>Lưu người dùng</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.userCol]}>Người dùng</Text>
            <Text style={[styles.headerCell, styles.roleCol]}>Role</Text>
            <Text style={[styles.headerCell, styles.statusCol]}>Trạng thái</Text>
            <Text style={[styles.headerCell, styles.statCol]}>Hiệu suất</Text>
            <Text style={[styles.headerCell, styles.actionCol]}>Thao tác</Text>
          </View>

          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.tableRow}>
              <View style={styles.userCol}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userMeta}>{user.email}</Text>
                <Text style={styles.userMeta}>{user.phone}</Text>
                {user.warehouseName ? (
                  <Text style={styles.userWarehouse}>{user.warehouseName}</Text>
                ) : null}
              </View>

              <View style={styles.roleCol}>
                <View style={styles.roleGrid}>
                  {roleOptions.map((item) => {
                    const active = user.role === item;

                    return (
                      <TouchableOpacity
                        key={item}
                        activeOpacity={0.82}
                        style={[styles.roleChip, active && styles.roleChipActive, webNoOutline]}
                        onPress={() => onChangeRole(user.id, item)}
                      >
                        <Text style={[styles.roleText, active && styles.roleTextActive]}>
                          {roleLabel(item)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.statusCol}>
                <View style={[styles.statusBadge, statusTone(user.status)]}>
                  <Text style={styles.statusText}>{accountStatusLabel(user.status)}</Text>
                </View>
                <Text style={styles.lastActive}>Online: {formatDateTime(user.lastActiveAt)}</Text>
              </View>

              <View style={styles.statCol}>
                <Text style={styles.statValue}>{user.totalOrders} đơn</Text>
                <Text style={styles.statSub}>{user.successRate}% thành công</Text>
              </View>

              <View style={styles.actionCol}>
                <TouchableOpacity
                  activeOpacity={0.82}
                  style={[styles.actionButton, webNoOutline]}
                  onPress={() => onChangeStatus(user.id, "locked_short")}
                >
                  <Text style={styles.actionText}>Khóa 7 ngày</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.82}
                  style={[styles.actionButtonDanger, webNoOutline]}
                  onPress={() => onChangeStatus(user.id, "locked_long")}
                >
                  <Text style={styles.actionTextDanger}>Khóa dài hạn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.82}
                  style={[styles.actionButtonGreen, webNoOutline]}
                  onPress={() => onChangeStatus(user.id, "active")}
                >
                  <Text style={styles.actionTextGreen}>Mở khóa</Text>
                </TouchableOpacity>

                {/* Xóa user — mở confirm modal thay vì browser confirm() */}
                <TouchableOpacity
                  activeOpacity={0.82}
                  style={[styles.actionButtonDelete, webNoOutline]}
                  onPress={() => setDeleteTarget(user)}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={14} color="#B42318" />
                  <Text style={styles.actionTextDelete}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Confirm xóa user — thay thế browser confirm() */}
      <Modal
        transparent
        animationType="fade"
        visible={!!deleteTarget}
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <MaterialCommunityIcons name="alert-outline" size={34} color="#B42318" />
            <Text style={styles.modalTitle}>Xóa tài khoản</Text>
            <Text style={styles.modalBody}>
              Xoá tài khoản{" "}
              <Text style={{ fontWeight: "700", color: colors.text }}>
                &ldquo;{deleteTarget?.fullName}&rdquo;
              </Text>
              ?{"\n"}Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.modalBtnCancel, webNoOutline]}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.modalBtnCancelText}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.modalBtnDelete, webNoOutline]}
                onPress={() => {
                  if (deleteTarget) onDeleteUser(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                <Text style={styles.modalBtnDeleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  panelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  panelDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  createButton: {
    height: 40,
    borderRadius: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 7,
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },

  searchBox: {
    /* flex: 1 để tự co giãn, maxWidth giữ không quá rộng */
    flex: 1,
    maxWidth: 330,
    minWidth: 180,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },

  filterRow: {
    alignItems: "center",
  },

  filterChip: {
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    backgroundColor: "#FFFFFF",
  },

  filterChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },

  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },

  filterTextActive: {
    color: "#0F6B3A",
  },

  createBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
    padding: 14,
    marginBottom: 14,
  },

  createInput: {
    height: 39,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    fontSize: 14,
    color: colors.text,
    marginBottom: 9,
  },

  roleCreateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  roleCreateChip: {
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    marginBottom: 7,
    backgroundColor: "#FFFFFF",
  },

  roleCreateChipActive: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brand,
  },

  roleCreateText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },

  roleCreateTextActive: {
    color: "#0F6B3A",
  },

  saveCreateButton: {
    height: 38,
    borderRadius: 6,
    backgroundColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  saveCreateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  table: {
    minWidth: 1080,
  },

  tableHeader: {
    height: 42,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  tableRow: {
    minHeight: 106,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  headerCell: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.3,
  },

  userCol: {
    width: 250,
    paddingRight: 12,
  },

  roleCol: {
    width: 290,
    paddingRight: 12,
  },

  statusCol: {
    width: 190,
    paddingRight: 12,
  },

  statCol: {
    width: 130,
    paddingRight: 12,
  },

  actionCol: {
    width: 220,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  userMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  userWarehouse: {
    fontSize: 12,
    color: "#0F6B3A",
    fontWeight: "600",
    marginTop: 5,
  },

  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  roleChip: {
    height: 29,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#FFFFFF",
  },

  roleChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },

  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },

  roleTextActive: {
    color: "#0F6B3A",
  },

  statusBadge: {
    minHeight: 29,
    borderRadius: 15,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },

  statusActive: {
    backgroundColor: colors.brandSoft,
  },

  statusWarning: {
    backgroundColor: colors.warningSoft,
  },

  statusDanger: {
    backgroundColor: colors.dangerSoft,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },

  lastActive: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 7,
  },

  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  statSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },

  actionButton: {
    height: 30,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#FFFFFF",
  },

  actionButtonDanger: {
    height: 30,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: colors.dangerSoft,
  },

  actionButtonGreen: {
    height: 30,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#B7E4C7",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#F0FDF4",
  },

  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },

  actionTextDanger: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B42318",
  },

  actionTextGreen: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F6B3A",
  },

  // Password fields trong create form
  passwordBox: {
    height: 39,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 11,
    marginBottom: 9,
  },

  passwordBoxError: {
    borderColor: colors.danger,
  },

  passwordInput: {
    flex: 1,
    height: 37,
    fontSize: 14,
    color: colors.text,
  },

  eyeButton: {
    width: 38,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
  },

  createErrorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: -6,
    marginBottom: 7,
    paddingLeft: 2,
  },

  // Nut Xoa user — do dam, nho hon cac nut khoa
  actionButtonDelete: {
    height: 30,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FECDCA",
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#FEF3F2",
    gap: 4,
  },

  actionTextDelete: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B42318",
  },

  // ---- Confirm Delete Modal ----
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  modalBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 26,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 10,
    marginBottom: 8,
  },

  modalBody: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  modalBtns: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  modalBtnCancel: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },

  modalBtnDelete: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#B42318",
    alignItems: "center",
    justifyContent: "center",
  },

  modalBtnDeleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
