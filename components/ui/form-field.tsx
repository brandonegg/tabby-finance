import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";
import { tabbyColors } from "@/lib/ui";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  errorTestID?: string;
}

export function FormField({ label, error, errorTestID, ...props }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text
        className={`mb-2 text-xs font-semibold uppercase tracking-[1.6px] ${
          error ? "text-tabby-danger" : "text-tabby-muted"
        }`}
      >
        {label}
      </Text>
      <TextInput
        className={`rounded-2xl border px-4 py-4 text-base text-tabby-ink ${
          error ? "border-tabby-danger/40 bg-tabby-danger-soft/40" : "border-tabby-line bg-white"
        }`}
        placeholderTextColor={tabbyColors.muted}
        {...props}
      />
      {error ? (
        <Text className="mt-2 text-sm leading-6 text-tabby-danger" testID={errorTestID}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
