import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Button, Text } from "linked-data-browser";

type GraphPathInputProps = {
  label: string;
  value: string[];
  predicateOptions: string[];
  onChange: (next: string[]) => void;
};

export function GraphPathInput({
  label,
  value,
  predicateOptions,
  onChange,
}: GraphPathInputProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          gap: 8,
        },
        label: {
          fontWeight: "600",
          fontSize: 13,
        },
        selectedRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        },
        pill: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: colors.card,
        },
        triggerButton: {
          alignSelf: "flex-start",
        },
        modalBackdrop: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: colors.background,
        },
        menuCard: {
          width: "100%",
          maxWidth: 420,
          maxHeight: 420,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          backgroundColor: colors.card,
          padding: 10,
        },
        menuItem: {
          marginBottom: 6,
        },
      }),
    [colors.background, colors.border, colors.card],
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const selected = value.filter((item) => item.trim().length > 0);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      {selected.length > 0 ? (
        <View style={styles.selectedRow}>
          {selected.map((item) => (
            <View key={item} style={styles.pill}>
              <Text>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Button
        text="Choose predicates"
        variant="secondary"
        style={styles.triggerButton}
        onPress={() => setIsOpen(true)}
      />
      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.menuCard}>
            <ScrollView>
              {predicateOptions.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <Button
                    key={option}
                    text={isSelected ? `Remove: ${option}` : `Add: ${option}`}
                    variant="secondary"
                    style={styles.menuItem}
                    onPress={() => {
                      if (isSelected) {
                        onChange(selected.filter((item) => item !== option));
                      } else {
                        onChange([...selected, option]);
                      }
                    }}
                  />
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
