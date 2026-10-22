import { itemModifierGroups, modifierGroups, type CartLine, type MenuItem, type ProductModifierRules } from "@/lib/demo-data";

/** Course is an order-level choice for every table product, not a product assignment. */
export function tableOrderModifierGroups(item: MenuItem, isTableOrder: boolean, rules?: ProductModifierRules) {
  const groups = itemModifierGroups(item, rules);
  const withoutCourse = groups.filter((group) => group.name !== "Course");
  if (!isTableOrder) return withoutCourse;
  const assignedCourse = groups.find((group) => group.name === "Course");
  const course = assignedCourse ?? modifierGroups.find((group) => group.name === "Course");
  if (!course) return withoutCourse;
  return [...withoutCourse, { ...course, required: assignedCourse?.required ?? false }];
}

export function lineCourse(line: CartLine): string | undefined {
  return line.modifiers?.find((modifier) => modifier.startsWith("Course · "))?.slice("Course · ".length).trim() || undefined;
}

/** Display only: keep insertion order within unassigned and assigned course items. */
export function tableOrderLines(lines: CartLine[], isTableOrder: boolean): CartLine[] {
  if (!isTableOrder) return lines;
  return [...lines.filter((line) => !lineCourse(line)), ...lines.filter((line) => Boolean(lineCourse(line)))];
}