"use client";
import { Indicator } from "@/types/management";
import { Select, MenuItem, Checkbox } from "@mui/material";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Crosshair } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

// Zod Schema
const subKpiSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "กรุณากรอกชื่อตัวชี้วัดย่อย"),
  target: z.string().min(1, "กรุณากรอกเป้าหมายตัวชี้วัดย่อย"),
});

const mainKpiSchema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อตัวชี้วัด").max(50),
  target: z.string().min(1, "กรุณากรอกเป้าหมาย"),
  unit: z.string().min(1, "กรุณาเลือกหน่วยของตัวชี้วัด"),
  frequency: z.string().min(1, "กรุณาเลือกรอบการรายงาน"),
  jobtitle: z.array(z.string().min(1, "กรุณาเลือกหน่วยงาน")),
  subKpis: z.array(subKpiSchema),
});

type FormData = z.infer<typeof mainKpiSchema>;

interface AddKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  mode?: "add" | "edit"; // บอกว่า modal ใช้โหมดไหน
  initialData?: Indicator | null; // ข้อมูลเริ่มต้น (ใช้ตอน edit)
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
  initialData,
}: AddKpiModalProps) {
  const isEdit = mode === "edit";
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const [frequencies, setFrequencies] = useState<Frequency[]>([]);
  const [jobtitles, setJobTitle] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnit] = useState<Unit[]>([]);

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
      target: "",
      unit: "",
      frequency: "",
      jobtitle: [],
      subKpis: [],
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
        target: initialData.target_value?.toString() || "",
        unit: initialData.unit.unit_id?.toString() || defaultUnit,
        frequency:
          initialData.frequency?.frequency_id?.toString() || defaultFrequency,
        jobtitle: initialData.responsible_jobtitles?.map((j) =>
          j.id.toString()
        ) || [defaultJobtitle],
        subKpis:
          initialData.sub_indicators?.map((s) => ({
            id: s.id.toString(),
            name: s.name,
            target: s.target_value?.toString() || "",
          })) || [],
      });
    } else {
      // กรณี Add
      reset({
        name: "",
        target: "",
        unit: defaultUnit,
        frequency: defaultFrequency,
        jobtitle: [defaultJobtitle],
        subKpis: [],
      });
    }
  }, [initialData, isEdit, loading, frequencies, jobtitles, reset]);

  // จัดการ เพิ่ม ลด ของ sub indicators
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subKpis",
  });

  if (!isOpen) return null;

  // submit
  const submitForm = async (data: FormData) => {
    alert(JSON.stringify(data, null, 2));
    await onSubmit(data);
    reset();
    setExpandedIndexes([]);
    onClose();
  };

  // สลับการขยาย sub indicators
  const toggleExpand = (idx: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
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
                name="target"
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
                    {errors.target && (
                      <span className="text-red-500 text-xs">
                        {errors.target.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* unit */}

              <Controller
                name="unit"
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
                        <MenuItem key={u.unit_id} value={u.unit_id}>
                          {u.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.frequency && (
                      <span className="text-red-500 text-xs">
                        {errors.frequency.message}
                      </span>
                    )}
                  </div>
                )}
              />
              {/* Frequency */}
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รอบการรายงาน
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
                      {frequencies.map((f) => (
                        <MenuItem key={f.frequency_id} value={f.frequency_id}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.frequency && (
                      <span className="text-red-500 text-xs">
                        {errors.frequency.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* JobTitle */}
              <Controller
                name="jobtitle"
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
                    {errors.jobtitle && (
                      <span className="text-red-500 text-xs">
                        {errors.jobtitle.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Sub-KPI */}
            <div className="mt-4">
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-purple-700 font-bold mb-2"
                onClick={() =>
                  append({ id: crypto.randomUUID(), name: "", target: "" })
                }
              >
                <Plus className="w-4 h-4" /> เพิ่มตัวชี้วัดย่อย
              </button>
              {fields.length === 0 ? (
                <div className="text-gray-500 text-sm mb-2">
                  ยังไม่มีตัวชี้วัดย่อย
                </div>
              ) : (
                <div className="space-y-1">
                  {fields.map((sub, idx) => (
                    <div key={sub.id}>
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
                          {/* Sub-KPI Name */}
                          <Controller
                            name={`subKpis.${idx}.name`}
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
                                  required
                                />
                                {errors.subKpis?.[idx]?.name && (
                                  <span className="text-red-500 text-xs">
                                    {errors.subKpis[idx]?.name?.message}
                                  </span>
                                )}
                              </div>
                            )}
                          />
                          {/* Sub-KPI Target */}
                          <Controller
                            name={`subKpis.${idx}.target`}
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
                                  required
                                />
                                {errors.subKpis?.[idx]?.target && (
                                  <span className="text-red-500 text-xs">
                                    {errors.subKpis[idx]?.target?.message}
                                  </span>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold"
              >
                {isEdit ? "บันทึกการแก้ไข" : "บันทึกตัวชี้วัด"}
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setExpandedIndexes([]);
                  onClose();
                }}
                className="border border-gray-400 px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
