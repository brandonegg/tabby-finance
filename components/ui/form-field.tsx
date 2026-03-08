import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";
import { tabbyColors } from "@/lib/ui";

interface FormFieldProps extends TextInputProps {
  label: string;
}

export function FormField({ label, ...props }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[1.6px] text-tabby-muted">
        {label}
      </Text>
      <TextInput
        className="rounded-2xl border border-tabby-line bg-white px-4 py-4 text-base text-tabby-ink"
        placeholderTextColor={tabbyColors.muted}
        {...props}
      />
    </View>
  );
}
