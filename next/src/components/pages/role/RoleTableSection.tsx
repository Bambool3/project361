"use client";

import CustomModal from "@/components/ui/custom-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import CustomTable from "@/components/ui/custom-table";
import { Role, RoleFormData } from "@/types/role";
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { Crown, Edit, Plus, Trash2 } from "lucide-react";
import RoleAddEdit from "./RoleAdd&Edit";
import { useNotification } from "@/providers/NotificationProvider";

interface RoleTableSectionProps {
  roles: Role[];
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export default function RoleTableSection({
  roles,
  loading,
  error,
  onRefresh,
}: RoleTableSectionProps) {
  const { showNotification } = useNotification();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleAddRole = () => {
    setIsAddModalOpen(true);
  };

  const handleAddRoleSubmit = async (formData: RoleFormData) => {
    try {
      const response = await fetch("/api/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        setIsAddModalOpen(false);
        showNotification("เพิ่มตำแหน่งสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        showNotification(
          "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
          "error"
        );
      } else if (response.status === 409) {
        showNotification("ตำแหน่งนี้มีอยู่ในระบบแล้ว", "warning");
      } else if (response.status === 500) {
        showNotification("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", "error");
      } else {
        showNotification("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
      }
    } catch (error) {
      console.error("Error adding role:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  const handleEditRoleSubmit = async (formData: RoleFormData) => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/role/${selectedRole.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        setSelectedRole(null);
        showNotification("แก้ไขตำแหน่งสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        showNotification(
          "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
          "error"
        );
      } else if (response.status === 404) {
        showNotification("ไม่พบตำแหน่งที่ต้องการแก้ไข", "error");
      } else if (response.status === 409) {
        showNotification("ชื่อตำแหน่งนี้มีอยู่ในระบบแล้ว", "warning");
      } else {
        showNotification("เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง", "error");
      }
    } catch (error) {
      console.error("Error editing role:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      const response = await fetch(`/api/role/${roleToDelete.id}`, {
        method: "DELETE",
      });

      setIsDeleteModalOpen(false);
      setRoleToDelete(null);

      if (response.status === 200) {
        showNotification("ลบตำแหน่งสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        const data = await response.json();
        showNotification(
          data.error || "ไม่สามารถลบตำแหน่งที่มีบุคลากรที่เกี่ยวข้องได้",
          "warning"
        );
      } else if (response.status === 404) {
        showNotification("ไม่พบตำแหน่งที่ต้องการลบ", "error");
      } else {
        showNotification("เกิดข้อผิดพลาดในการลบตำแหน่ง", "error");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  const columns = [
    {
      id: "name",
      label: "ชื่อตำแหน่ง",
      searchable: true,
      render: (role: Role, index: number) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontWeight: "600", color: "#1e293b" }}>
            {role.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: "employeeCount",
      label: "จำนวนบุคลากร",
      align: "center" as const,
      render: (role: Role) => (
        <Chip
          label={`${role.employeeCount || 0} คน`}
          size="small"
          sx={{
            backgroundColor: "#f1f5f9",
            color: "#475569",
            fontWeight: "600",
          }}
        />
      ),
    },
    {
      id: "actions",
      label: "จัดการ",
      align: "center" as const,
      render: (role: Role) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Tooltip
            title="แก้ไขข้อมูลตำแหน่ง"
            arrow
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "#1e293b",
                  color: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  fontSize: "0.875rem",
                },
              },
              arrow: { sx: { color: "#1e293b" } },
            }}
          >
            <IconButton
              onClick={() => {
                setSelectedRole(role);
                setIsEditModalOpen(true);
              }}
              size="small"
              sx={{
                color: "#64748b",
                "&:hover": {
                  color: "#8b5cf6",
                  backgroundColor: "#f1f5f9",
                },
              }}
            >
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip
            title="ลบตำแหน่งนี้ออกจากระบบ"
            arrow
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "#1e293b",
                  color: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  fontSize: "0.875rem",
                },
              },
              arrow: { sx: { color: "#1e293b" } },
            }}
          >
            <IconButton
              onClick={() => {
                setRoleToDelete(role);
                setIsDeleteModalOpen(true);
              }}
              size="small"
              sx={{
                color: "#64748b",
                "&:hover": {
                  color: "#ef4444",
                  backgroundColor: "#fef2f2",
                },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const headerActions = (
    <Tooltip
      title="เพิ่มตำแหน่งใหม่"
      arrow
      placement="top"
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: "#1e293b",
            color: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontSize: "0.875rem",
          },
        },
        arrow: { sx: { color: "#1e293b" } },
      }}
    >
      <Button
        onClick={handleAddRole}
        startIcon={<Plus size={18} />}
        sx={{
          backgroundColor: "#8b5cf6",
          color: "white",
          textTransform: "none",
          fontWeight: 600,
          px: 2,
          py: 1,
          borderRadius: "12px",
          "&:hover": { backgroundColor: "#7c3aed" },
        }}
      >
        เพิ่มตำแหน่ง
      </Button>
    </Tooltip>
  );

  return (
    <>
      <CustomTable
        data={roles}
        columns={columns}
        loading={loading}
        error={error}
        title="รายการตำแหน่ง"
        icon={<Crown size={24} color="#3b82f6" />}
        searchPlaceholder="ค้นหาตำแหน่ง..."
        onRefresh={onRefresh}
        emptyMessage="ไม่มีข้อมูลตำแหน่ง"
        searchableFields={["name"]}
        headerAction={headerActions}
      />

      {/* Add Role Modal */}
      <CustomModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มตำแหน่งใหม่"
        maxWidth="sm"
        showActions={false}
      >
        <RoleAddEdit
          onSubmit={handleAddRoleSubmit}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </CustomModal>

      {/* Edit Role Modal */}
      <CustomModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRole(null);
        }}
        title="แก้ไขข้อมูลตำแหน่ง"
        maxWidth="sm"
        showActions={false}
      >
        <RoleAddEdit
          role={selectedRole}
          onSubmit={handleEditRoleSubmit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedRole(null);
          }}
        />
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบตำแหน่ง"
        message={`คุณแน่ใจหรือไม่ที่จะลบตำแหน่ง "${roleToDelete?.name}" ออกจากระบบ?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        severity="error"
      />
    </>
  );
}
