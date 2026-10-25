"use client";

import { Alert, Button, Checkbox, Form, Input, InputNumber, Radio } from "antd";
import type { InputProps } from "antd";
import type { TextAreaProps } from "antd/es/input";
import { useId, type ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type UseFormHandleSubmit,
} from "react-hook-form";

/*
 * Ant Design inputs bound to React Hook Form. Validation stays with RHF + Zod
 * (shared with the server); antd Form only provides layout and status styling.
 */

type FieldProps<T extends FieldValues, TOut extends FieldValues> = {
  control: Control<T, unknown, TOut>;
  name: Path<T>;
  label: string;
  hint?: ReactNode;
  required?: boolean;
};

function Item({
  id,
  label,
  hint,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Form.Item
      label={label}
      htmlFor={id}
      required={required}
      validateStatus={error ? "error" : undefined}
      help={error}
      extra={hint}
    >
      {children}
    </Form.Item>
  );
}

/** antd <Form> whose submit runs the RHF submit handler. */
export function AntForm({
  onSubmit,
  children,
}: {
  onSubmit: ReturnType<UseFormHandleSubmit<FieldValues>>;
  children: ReactNode;
}) {
  return (
    <Form layout="vertical" requiredMark onFinish={() => onSubmit()} noValidate>
      {children}
    </Form>
  );
}

export function TextInput<T extends FieldValues, TOut extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  password,
  onValueChange,
  ...input
}: FieldProps<T, TOut> &
  Omit<InputProps, "name" | "value" | "onChange"> & {
    password?: boolean;
    /** Called after the field value changes (e.g. to derive another field). */
    onValueChange?: (value: string) => void;
  }) {
  const id = useId();
  const Component = password ? Input.Password : Input;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Item id={id} label={label} hint={hint} required={required} error={fieldState.error?.message}>
          <Component
            {...input}
            id={id}
            ref={field.ref}
            name={field.name}
            value={(field.value as string | null | undefined) ?? ""}
            onChange={(event) => {
              field.onChange(event);
              onValueChange?.(event.target.value);
            }}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
          />
        </Item>
      )}
    />
  );
}

export function TextAreaInput<T extends FieldValues, TOut extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  ...input
}: FieldProps<T, TOut> & Omit<TextAreaProps, "name" | "value" | "onChange">) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Item id={id} label={label} hint={hint} required={required} error={fieldState.error?.message}>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 8 }}
            {...input}
            id={id}
            ref={field.ref}
            name={field.name}
            value={(field.value as string | null | undefined) ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
          />
        </Item>
      )}
    />
  );
}

export function NumberInput<T extends FieldValues, TOut extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  min = 0,
  prefix,
  rupiah,
}: FieldProps<T, TOut> & { min?: number; prefix?: ReactNode; rupiah?: boolean }) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Item id={id} label={label} hint={hint} required={required} error={fieldState.error?.message}>
          <InputNumber<number>
            id={id}
            ref={field.ref}
            name={field.name}
            style={{ width: "100%" }}
            min={min}
            step={1}
            precision={0}
            prefix={prefix}
            // Rupiah amounts use dot thousands separators: 1.500.000
            formatter={rupiah ? (v) => `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined}
            parser={rupiah ? (v) => Number((v ?? "").replace(/\./g, "")) : undefined}
            value={toNumberOrNull(field.value)}
            onChange={(value) => field.onChange(value ?? null)}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
          />
        </Item>
      )}
    />
  );
}

function toNumberOrNull(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function CheckboxInput<T extends FieldValues, TOut extends FieldValues>({
  control,
  name,
  label,
  hint,
}: Omit<FieldProps<T, TOut>, "required">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item extra={hint} style={{ marginBottom: 12 }}>
          <Checkbox
            ref={field.ref}
            name={field.name}
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            onBlur={field.onBlur}
          >
            <span className="font-semibold">{label}</span>
          </Checkbox>
        </Form.Item>
      )}
    />
  );
}

export function RadioInput<T extends FieldValues, TOut extends FieldValues>({
  control,
  name,
  label,
  options,
}: Omit<FieldProps<T, TOut>, "hint" | "required"> & { options: { value: string; label: string }[] }) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Item id={id} label={label} error={fieldState.error?.message}>
          <Radio.Group
            id={id}
            name={field.name}
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
            options={options}
          />
        </Item>
      )}
    />
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Alert type="error" showIcon title={message} style={{ marginBottom: 16 }} />;
}

export function SubmitBar({ pending, label = "Simpan" }: { pending: boolean; label?: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="primary" htmlType="submit" loading={pending}>
        {pending ? "Menyimpan…" : label}
      </Button>
    </div>
  );
}
