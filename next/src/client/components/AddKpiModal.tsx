"use client";
import { Indicator } from "@/types/management";
import { Select, MenuItem, Checkbox, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Crosshair } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";

// Zod Schema
const sub_indicatorsSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "กรุณากรอกชื่อตัวชี้วัดย่อย"),
  target_value: z
    .string()
    .min(1, "กรุณากรอกเป้าหมายตัวชี้วัดย่อย")
    .refine((val) => !isNaN(Number(val)), {
      message: "กรุณากรอกเป็นตัวเลขเท่านั้น",
    }),
  position: z.number(),
});

const mainKpiSchema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อตัวชี้วัด").max(500),
  target_value: z.string().min(1, "กรุณากรอกเป้าหมาย"),
  unit_id: z.string().min(1, "กรุณาเลือกหน่วยของตัวชี้วัด"),
  frequency_id: z.string().min(1, "กรุณาเลือกรอบการรายงาน"),
  jobtitle_ids: z.array(z.string().min(1, "กรุณาเลือกหน่วยงาน")),
  sub_indicators: z.array(sub_indicatorsSchema),
});

type FormData = z.infer<typeof mainKpiSchema>;

interface AddKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: FormData,
    mode: "add" | "edit",
    categoryId: string
  ) => Promise<void>;
  mode?: "add" | "edit"; // บอกว่า modal ใช้โหมดไหน
  initialData?: Indicator | null; // ข้อมูลเริ่มต้น (ใช้ตอน edit)
  categoryId: string;
}

interface Frequency {
  frequency_id: string;
  name: string;
}

interface JobTitle {
  jobtitle_id: number;
  name: string;
}

interface Unit {
  unit_id: number;
  name: string;
}

const kpiunits = ["1,234", "$1,234.56", "15%"];

export default function AddKpiModal({
  isOpen,
  onClose,
  mode = "add",
  onSubmit,
  initialData,
  categoryId,
}: AddKpiModalProps) {
  const isEdit = mode === "edit";
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const [frequencies, setFrequencies] = useState<Frequency[]>([]);
  const [jobtitles, setJobTitle] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnit] = useState<Unit[]>([]);
  // เพิ่ม state สำหรับจัดการสถานะการ submit ด้านบนของ component
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดีงข้อมูล ความถี่,แผนก
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/api/frequency").then((res) => res.json()),
      fetch("http://localhost:3000/api/jobTitle").then((res) => res.json()),
      fetch("http://localhost:3000/api/unit").then((res) => res.json()),
    ])
      .then(([freqData, jobData, unitData]) => {
        setFrequencies(
          freqData.map((f: any) => ({
            frequency_id: f.frequency_id.toString(),
            name: f.name,
          }))
        );
        setJobTitle(
          jobData.map((j: any) => ({
            jobtitle_id: j.id,
            name: j.jobTitle_name,
          }))
        );
        setUnit(
          unitData.map((u: any) => ({
            unit_id: u.unit_id,
            name: u.name,
          }))
        );
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // ค่าเริ่มต้น
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(mainKpiSchema),
    defaultValues: {
      name: "",
      target_value: "",
      unit_id: "",
      frequency_id: "",
      jobtitle_ids: [],
      sub_indicators: [],
    },
  });

  useEffect(() => {
    if (loading) return; // รอให้โหลด frequencies และ jobtitles เสร็จ

    const defaultFrequency = frequencies[0]?.frequency_id?.toString() || "";
    const defaultJobtitle = jobtitles[0]?.jobtitle_id?.toString() || "";
    const defaultUnit = units[0]?.unit_id?.toString() || "";

    if (isEdit && initialData) {
      reset({
        name: initialData.name || "",
        target_value: initialData.target_value?.toString() || "",
        unit_id: initialData.unit.unit_id?.toString() || defaultUnit,
        frequency_id:
          initialData.frequency?.frequency_id?.toString() || defaultFrequency,
        jobtitle_ids: initialData.responsible_jobtitles?.map((j) =>
          j.id.toString()
        ) || [defaultJobtitle],
        sub_indicators:
          initialData.sub_indicators?.map((s, i) => ({
            id: s.id.toString(),
            name: s.name,
            target_value: s.target_value?.toString() || "",
            position: i + 1, // เพิ่มตรงนี้
          })) || [],
      });
    } else {
      // กรณี Add
      reset({
        name: "",
        target_value: "",
        unit_id: defaultUnit,
        frequency_id: defaultFrequency,
        jobtitle_ids: [defaultJobtitle],
        sub_indicators: [],
      });
    }
  }, [initialData, isEdit, loading, frequencies, jobtitles, reset]);

  // จัดการ เพิ่ม ลด ของ sub indicators
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sub_indicators",
  });

  if (!isOpen) return null;

  // submit
  const submitForm = async (data: FormData) => {
    if (!data) return;
    try {
      const dataToSubmit = {
        ...data,
        sub_indicators: data.sub_indicators.map((s, i) => ({
          ...s,
          position: i + 1,
        })),
      };
      // alert(
      //   JSON.stringify(
      //     {
      //       data: dataToSubmit,
      //       mode: mode,
      //       categoryId: categoryId,
      //     },
      //     null,
      //     2
      //   )
      // );
      await onSubmit(dataToSubmit, mode, categoryId);
      setExpandedIndexes([]);
    } catch (error) {
      console.error("Submission failed:", error); // แสดง error ใน console สำหรับนักพัฒนา
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง"); // แจ้งเตือนผู้ใช้
    } finally {
      setIsSubmitting(false);
    }
  };

  // สลับการขยาย sub indicators
  const toggleExpand = (idx: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Drag & Drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    if (fromIndex === toIndex) return;
    move(fromIndex, toIndex);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl m-4 z-50 overflow-auto max-h-[90vh] transition-all duration-300">
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isEdit ? "แก้ไขตัวชี้วัด" : "เพิ่มตัวชี้วัด"}
            </h2>
            <div className="flex flex-row flex-wrap gap-4 mb-8">
              {/* Name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[180px] max-w-[240px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อตัวชี้วัด
                    </label>
                    <div className="relative">
                      <input
                        {...field}
                        placeholder="กรอกชื่อตัวชี้วัด"
                        className="pl-4 pr-12 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        <Crosshair className="w-5 h-5" />
                      </div>
                    </div>
                    {errors.name && (
                      <span className="text-red-500 text-xs">
                        {errors.name.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* Target */}
              <Controller
                name="target_value"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เป้าหมาย
                    </label>
                    <input
                      {...field}
                      placeholder="ระบุเป้าหมาย"
                      className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                    />
                    {errors.target_value && (
                      <span className="text-red-500 text-xs">
                        {errors.target_value.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* unit */}

              <Controller
                name="unit_id"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รูปแบบข้อมูล
                    </label>
                    <Select
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      displayEmpty
                      variant="outlined"
                      MenuProps={{ disablePortal: true }}
                      sx={{
                        width: "100%",
                        borderRadius: "0.5rem",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#d1d5db",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8b5cf6",
                        },
                        "& .MuiSelect-select": { px: 2, py: 1.1 },
                      }}
                    >
                      {units.map((u) => (
                        <MenuItem key={u.unit_id} value={u.unit_id.toString()}>
                          {u.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.unit_id && (
                      <span className="text-red-500 text-xs">
                        {errors.unit_id.message}
                      </span>
                    )}
                  </div>
                )}
              />
              {/* Frequency */}
              <Controller
                name="frequency_id"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รอบการรายงาน
                    </label>
                    <Select
                      disabled={isEdit}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      displayEmpty
                      variant="outlined"
                      MenuProps={{ disablePortal: true }}
                      sx={{
                        width: "100%",
                        borderRadius: "0.5rem",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: isEdit ? "#d1d5db" : "#d1d5db",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8b5cf6",
                        },
                        "& .MuiSelect-select": {
                          px: 2,
                          py: 1.1,
                          color: isEdit ? "#6b7280" : "inherit",
                          backgroundColor: isEdit ? "#e7edf8ff" : "inherit",
                        },
                      }}
                    >
                      {frequencies.map((f) => (
                        <MenuItem key={f.frequency_id} value={f.frequency_id}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.frequency_id && (
                      <span className="text-red-500 text-xs">
                        {errors.frequency_id.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* JobTitle */}
              <Controller
                name="jobtitle_ids"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[140px] max-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      หน่วยงาน
                    </label>
                    <Select
                      {...field}
                      multiple
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={(e) =>
                        field.onChange(e.target.value as string[])
                      }
                      displayEmpty
                      variant="outlined"
                      MenuProps={{ disablePortal: true }}
                      renderValue={(selected) =>
                        jobtitles
                          .filter((j) =>
                            selected.includes(j.jobtitle_id.toString())
                          )
                          .map((j) => j.name)
                          .join(", ")
                      }
                      sx={{
                        width: "100%",
                        borderRadius: "0.5rem",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#d1d5db",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8b5cf6",
                        },
                        "& .MuiSelect-select": { px: 2, py: 1.1 },
                      }}
                    >
                      {jobtitles.map((j) => (
                        <MenuItem key={j.jobtitle_id} value={j.jobtitle_id}>
                          <Checkbox
                            checked={
                              Array.isArray(field.value) &&
                              field.value.includes(j.jobtitle_id.toString())
                            }
                            size="small"
                          />
                          {j.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.jobtitle_ids && (
                      <span className="text-red-500 text-xs">
                        {errors.jobtitle_ids.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Sub-KPI */}
            <div className="mt-4">
              <Button
                type="button"
                variant="text" // ปุ่มแบบไม่มี background
                color="primary"
                size="small"
                onClick={() =>
                  append({
                    id: crypto.randomUUID(),
                    name: "",
                    target_value: "",
                    position: fields.length + 1,
                  })
                }
                startIcon={<Plus className="w-4 h-4" />}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  mb: 2,
                  color: "#7C3AED", // text-purple-700
                  "&:hover": {
                    backgroundColor: "#f9f3ffff", // ไม่มี background ตอน hover
                    color: "#5B21B6", // text-purple-900
                  },
                }}
              >
                เพิ่มตัวชี้วัดย่อย
              </Button>
              {fields.length === 0 ? (
                <div className="text-gray-500 text-sm mb-2">
                  ยังไม่มีตัวชี้วัดย่อย
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="subKpisDroppable">
                    {(provided: DroppableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2"
                      >
                        {fields.map((sub, idx) => (
                          <Draggable
                            key={sub.id}
                            draggableId={sub.id}
                            index={idx}
                          >
                            {(provided: DraggableProvided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 border-2 border-purple-50 rounded-xl bg-white shadow-md hover:scale-101"
                              >
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    className="mr-2"
                                    onClick={() => toggleExpand(idx)}
                                  >
                                    {expandedIndexes.includes(idx) ? (
                                      <ChevronUp className="w-5 h-5" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5" />
                                    )}
                                  </button>
                                  <span className="font-semibold text-gray-900">
                                    {sub.name || "ชื่อตัวชี้วัดย่อย"}
                                  </span>
                                  <span className="ml-3 text-xs text-gray-500">
                                    (ตัวชี้วัดย่อยที่ {idx + 1})
                                  </span>
                                  <button
                                    type="button"
                                    className="ml-auto text-red-500"
                                    onClick={() => remove(idx)}
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>

                                {expandedIndexes.includes(idx) && (
                                  <div className="flex flex-row flex-wrap items-end bg-gray-100 border-l-4 border-purple-400 p-4 mt-2 rounded-lg gap-4">
                                    <Controller
                                      name={`sub_indicators.${idx}.name`}
                                      control={control}
                                      render={({ field }) => (
                                        <div className="flex flex-col flex-1 min-w-[200px] max-w-[280px]">
                                          <label className="text-xs font-medium text-gray-700 mb-1">
                                            ชื่อตัวชี้วัด
                                          </label>
                                          <input
                                            {...field}
                                            placeholder="ชื่อตัวชี้วัด"
                                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
                                          />
                                          {errors.sub_indicators?.[idx]
                                            ?.name && (
                                            <span className="text-red-500 text-xs">
                                              {
                                                errors.sub_indicators[idx]?.name
                                                  ?.message
                                              }
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    />
                                    <Controller
                                      name={`sub_indicators.${idx}.target_value`}
                                      control={control}
                                      render={({ field }) => (
                                        <div className="flex flex-col flex-1 min-w-[200px] max-w-[280px]">
                                          <label className="text-xs font-medium text-gray-700 mb-1">
                                            เป้าหมาย
                                          </label>
                                          <input
                                            {...field}
                                            placeholder="เป้าหมาย"
                                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
                                          />
                                          {errors.sub_indicators?.[idx]
                                            ?.target_value && (
                                            <span className="text-red-500 text-xs">
                                              {
                                                errors.sub_indicators[idx]
                                                  ?.target_value?.message
                                              }
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#8b5cf6",
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "#7c3aed",
                  },
                  "&:disabled": {
                    backgroundColor: "#cbd5e1",
                  },
                }}
              >
                {isEdit ? "บันทึกการแก้ไข" : "บันทึกตัวชี้วัด"}
              </Button>

              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={() => {
                  reset();
                  setExpandedIndexes([]);
                  onClose();
                }}
                sx={{
                  color: "#64748b",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
