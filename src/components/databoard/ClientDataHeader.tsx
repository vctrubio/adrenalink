"use client";

import { useLayoutEffect, useRef, useMemo } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { DATABOARD_ENTITY_SEARCH_FIELDS } from "@/config/databoard";
import { useDataboard } from "@/src/hooks/useDataboard";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import { GroupDataRows } from "./GroupDataRows";
import type { AbstractModel } from "@/backend/models/AbstractModel";
import type { StatItem } from "@/src/components/ui/row";
