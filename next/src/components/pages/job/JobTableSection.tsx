"use client";

import CustomModal from "@/components/ui/custom-modal";
import ConfirmModal from "@/components/ui/confirm-modal";
import CustomTable from "@/components/ui/custom-table";
import { Job, JobFormData } from "@/types/job";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Chip,
} from "@mui/material";
import { Edit, Trash2, Plus, Building2 } from "lucide-react";
import { useState } from "react";
import JobAddEdit from "./JobAdd&Edit";
import { useNotification } from "@/providers/NotificationProvider";

interface JobTableSectionProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export default function JobTableSection({
  jobs,
  loading,
  error,
  onRefresh,
}: JobTableSectionProps) {
  const { showNotification } = useNotification();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const handleAddJob = () => {
    setIsAddModalOpen(true);
  };

  const handleAddJobSubmit = async (formData: JobFormData) => {
    try {
      const response = await fetch("/api/jobTitle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        setIsAddModalOpen(false);
        showNotification("เพิ่มหน่วยงานสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        showNotification(
          "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
          "error"
        );
      } else if (response.status === 409) {
        showNotification("หน่วยงานนี้มีอยู่ในระบบแล้ว", "warning");
      } else if (response.status === 500) {
        showNotification("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", "error");
      } else {
        showNotification("เกิดข้อผิดพลาดที่ไม่คาดคิด", "error");
      }
    } catch (error) {
      console.error("Error adding job:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  const handleEditJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsEditModalOpen(true);
    }
  };

  const handleEditJobSubmit = async (formData: JobFormData) => {
    if (!selectedJob) return;

    try {
      const response = await fetch(`/api/jobTitle/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        setSelectedJob(null);
        showNotification("แก้ไขหน่วยงานสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        showNotification(
          "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง",
          "error"
        );
      } else if (response.status === 404) {
        showNotification("ไม่พบหน่วยงานที่ต้องการแก้ไข", "error");
      } else if (response.status === 409) {
        showNotification("ชื่อหน่วยงานนี้มีอยู่ในระบบแล้ว", "warning");
      } else {
        showNotification("เกิดข้อผิดพลาดในการแก้ไขหน่วยงาน", "error");
      }
    } catch (error) {
      console.error("Error editing job:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  const handleDeleteJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setJobToDelete(job);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      const response = await fetch(`/api/jobTitle/${jobToDelete.id}`, {
        method: "DELETE",
      });

      setIsDeleteModalOpen(false);
      setJobToDelete(null);

      if (response.status === 200) {
        showNotification("ลบหน่วยงานสำเร็จ!", "success");
        if (onRefresh) {
          onRefresh();
        }
      } else if (response.status === 400) {
        const data = await response.json();
        showNotification(
          data.error || "ไม่สามารถลบหน่วยงานที่มีบุคลากรที่เกี่ยวข้องได้",
          "warning"
        );
      } else if (response.status === 404) {
        showNotification("ไม่พบหน่วยงานที่ต้องการลบ", "error");
      } else {
        showNotification("เกิดข้อผิดพลาดในการลบหน่วยงาน", "error");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    }
  };

  const columns = [
    {
      id: "name",
      label: "ชื่อหน่วยงาน",
      searchable: true,
      render: (job: Job, index: number) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontWeight: "600", color: "#1e293b" }}>
            {job.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: "employeeCount",
      label: "จำนวนบุคลากร",
      align: "center" as const,
      render: (job: Job) => (
        <Chip
          label={`${job.employeeCount || 0} คน`}
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
      render: (job: Job) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Tooltip
            title="แก้ไขข้อมูลหน่วยงาน"
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
              onClick={() => handleEditJob(job.id)}
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
            title="ลบหน่วยงานนี้ออกจากระบบ"
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
              onClick={() => handleDeleteJob(job.id)}
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
      title="เพิ่มหน่วยงานใหม่"
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
        onClick={handleAddJob}
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
        เพิ่มหน่วยงาน
      </Button>
    </Tooltip>
  );

  return (
    <>
      <CustomTable
        data={jobs}
        columns={columns}
        loading={loading}
        error={error}
        title="รายการหน่วยงาน"
        icon={<Building2 size={24} color="#3b82f6" />}
        searchPlaceholder="ค้นหาหน่วยงาน..."
        onRefresh={onRefresh}
        emptyMessage="ไม่มีข้อมูลหน่วยงาน"
        searchableFields={["name"]}
        headerAction={headerActions}
      />

      {/* Add Job Modal */}
      <CustomModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มหน่วยงานใหม่"
        maxWidth="sm"
        showActions={false}
      >
        <JobAddEdit
          onSubmit={handleAddJobSubmit}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </CustomModal>

      {/* Edit Job Modal */}
      <CustomModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedJob(null);
        }}
        title="แก้ไขข้อมูลหน่วยงาน"
        maxWidth="sm"
        showActions={false}
      >
        <JobAddEdit
          job={selectedJob}
          onSubmit={handleEditJobSubmit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedJob(null);
          }}
        />
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setJobToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบหน่วยงาน"
        message={`คุณแน่ใจหรือไม่ที่จะลบหน่วยงาน "${jobToDelete?.name}" ออกจากระบบ?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        severity="error"
      />
    </>
  );
}
