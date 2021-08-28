import * as React from "react";
import RadioGroupMUI from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import RRule from "rrule";
import moment from "moment";
import { withStyles } from "@material-ui/styles";
import { AppointmentForm } from "@devexpress/dx-react-scheduler-material-ui";

const getRecurrenceOptions = rule => {
  if (!rule) return null;
  const options = RRule.parseString(rule);
  if (options.byweekday) {
    const byweekday = options.byweekday.map(weekDay => weekDay.weekday);
    options.byweekday = byweekday;
  }
  return options;
};
const changeRecurrenceOptions = options => {
  return options ? new RRule({ ...options }).toString() : undefined;
};
const checkIsNaturalNumber = number =>
  number > 0 && number <= Number.MAX_SAFE_INTEGER;
const isDateValid = date => moment(date).isValid();

const styles = ({ spacing }) => ({
  textEditor: {
    width: "calc(100% - 4.5em)"
  },
  label: {
    width: "4.5em"
  },
  input: {
    paddingBottom: spacing(2.75)
  },
  dateEditor: {
    width: "calc(100% - 4.5em)"
  },
  formControl: {
    marginRight: 0
  },
  controlLabel: {
    width: "100%"
  }
});

const EndRepeatEditorBase = ({
  classes,
  getMessage,
  labelComponent: Label,
  textEditorComponent: TextEditor,
  dateEditorComponent: DateEditor,
  onFieldChange,
  appointmentData,
  locale,
  readOnly,
  ...restProps
}) => {
  const [count, setCount] = React.useState(1);
  const [endDate, setEndDate] = React.useState(appointmentData.endDate);

  const { rRule } = appointmentData;
  const recurrenceOptions = React.useMemo(
    () => getRecurrenceOptions(rRule) || {},
    [rRule]
  );
  const changeRecurrenceCount = React.useCallback(
    nextCount =>
      checkIsNaturalNumber(nextCount) &&
      onFieldChange({
        rRule: changeRecurrenceOptions({
          ...recurrenceOptions,
          count: nextCount
        })
      }),
    [recurrenceOptions, onFieldChange]
  );
  const changeRecurrenceEndDate = React.useCallback(
    date => {
      if (isDateValid(date)) {
        onFieldChange({
          rRule: changeRecurrenceOptions({ ...recurrenceOptions, until: date })
        });
      }
    },
    [recurrenceOptions, onFieldChange]
  );

  const countEditorProps = React.useMemo(
    () => ({
      endAdornment: (
        <InputAdornment position="end">
          {getMessage("occurrencesLabel")}
        </InputAdornment>
      )
    }),
    []
  );

  const recurrenceCount = recurrenceOptions.count || count;
  const recurrenceEndDate = recurrenceOptions.until || endDate;
  let value;
  if (recurrenceOptions.count) {
    value = "endAfter";
  } else if (recurrenceOptions.until) {
    value = "endBy";
  } else {
    value = "never";
  }

  const onRadioGroupValueChange = event => {
    let change;
    switch (event.target.value) {
      case "endAfter":
        setEndDate(recurrenceOptions.until || endDate);
        change = { count, until: undefined };
        break;
      case "endBy":
        setCount(recurrenceOptions.count || count);
        change = { count: undefined, until: endDate };
        break;
      default:
        break;
    }
    onFieldChange({
      rRule: changeRecurrenceOptions({
        ...recurrenceOptions,
        ...change
      })
    });
  };
  return (
    <RadioGroupMUI
      onChange={onRadioGroupValueChange}
      value={value}
      {...restProps}
    >
      <FormControlLabel
        className={classes.formControl}
        value="endAfter"
        classes={{ label: classes.controlLabel }}
        control={<Radio color="primary" />}
        disabled={readOnly}
        label={
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
          >
            <Label className={classes.label} text={getMessage("onLabel")} />
            <TextEditor
              readOnly={readOnly || value !== "endAfter"}
              className={classes.textEditor}
              value={recurrenceCount}
              type={"numberEditor"}
              onValueChange={changeRecurrenceCount}
              InputProps={countEditorProps}
            />
          </Grid>
        }
      />
      <FormControlLabel
        className={classes.formControl}
        classes={{ label: classes.controlLabel }}
        value="endBy"
        disabled={readOnly}
        control={<Radio color="primary" />}
        label={
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
          >
            <Label className={classes.label} text={getMessage("afterLabel")} />
            <DateEditor
              className={classes.dateEditor}
              readOnly={readOnly || value !== "endBy"}
              value={recurrenceEndDate}
              onValueChange={changeRecurrenceEndDate}
              allowKeyboardControl={false}
              locale={locale}
              excludeTime={appointmentData.allDay}
            />
          </Grid>
        }
      />
    </RadioGroupMUI>
  );
};

const EndRepeatEditor = withStyles(styles)(EndRepeatEditorBase, {
  name: "EndRepeatEditor"
});

 const RadioGroup = ({ type, ...restProps }) => {
  if (type !== "endRepeat") {
    return <AppointmentForm.RadioGroup {...restProps} type={type} />;
  }
  return <EndRepeatEditor {...restProps} />;
};

export default RadioGroup